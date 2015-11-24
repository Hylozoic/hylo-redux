import { inspect } from 'util'
import { omit } from 'lodash'
import { fetchJSON } from './util/api'
import { debug } from './util/logging'
import { blue } from 'chalk'

// TODO cache expiration
export function cacheMiddleware (store) {
  return next => action => {
    let { cache } = action.meta || {}
    let { bucket, id, array, limit, offset } = cache || {}
    if (!bucket) return next(action)

    if (array) {
      let hit = store.getState()[bucket][id]
      if (hit && hit.length > offset) {
        debug(`cache hit: ${bucket}[${id}][${offset}] + ${limit}`)
        return
      }
    } else {
      let hit = store.getState()[bucket][id]
      if (hit) {
        debug(`cache hit: ${bucket}[${id}]`)
        return
      }
    }

    return next(action)
  }
}

export function apiMiddleware (req) {
  return store => next => action => {
    let { payload } = action
    if (payload && payload.api) {
      let { path, params, method } = payload
      let cookie = req && req.headers.cookie
      let promise = fetchJSON(path, params, {method, cookie})
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
