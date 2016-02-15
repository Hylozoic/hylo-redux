import { inspect } from 'util'
import { has, omit } from 'lodash'
import { fetchJSON } from './util/api'
import { debug } from './util/logging'
import { blue } from 'chalk'
import { find, values } from 'lodash'

// TODO cache expiration
export function cacheMiddleware (store) {
  return next => action => {
    let { cache } = action.meta || {}
    let { bucket, id, match, array, limit, offset, requiredProp, refresh } = cache || {}
    if (!bucket) return next(action)
    let state = store.getState()
    if (!state[bucket]) return next(action)

    let hit = refresh
      ? null
      : (match
        ? find(values(state[bucket]), match)
        : (id
          ? state[bucket][id]
          : state[bucket]))

    if (array) {
      if (hit && hit.length > offset) {
        debug(`cache hit: ${bucket}[${id}][${offset}] + ${limit}`)
        return Promise.resolve(action)
      }
    } else {
      if (hit && !requiredProp || has(hit, requiredProp)) {
        debug(`cache hit: ${bucket}[${id}]`)
        return Promise.resolve(action)
      }
    }

    return next(action)
  }
}

export function apiMiddleware (req) {
  return store => next => action => {
    let { payload, meta } = action
    if (payload && payload.api) {
      let { path, params, method } = payload
      let cookie = req && req.headers.cookie
      let promise = fetchJSON(path, params, {method, cookie})
      if (meta && meta.then) {
        promise = promise.then(meta.then)
      }
      return next({...action, payload: promise})
    }
    return next(action)
  }
}

export function serverLogger (store) {
  return next => action => {
    let { payload } = action

    if (!payload || !payload.api) {
      debug(blue('action:'), inspect(omit(action, 'payload')))
    } else {
      debug(blue('action:'), inspect({api: true, ...omit(action, 'payload')}))
    }

    return next(action)
  }
}

function isPromise (value) {
  return value && typeof value.then === 'function'
}

export function pendingPromiseMiddleware (store) {
  return next => action => {
    let { type, payload } = action
    if (isPromise(payload)) {
      store.dispatch({...action, type: type + '_PENDING', payload: null})
    }
    return next(action)
  }
}
