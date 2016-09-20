import { inspect } from 'util'
import { fetchJSON } from './util/api'
import { debug } from './util/logging'
import { blue } from 'chalk'
import { find, forEach, values, get, has, omit } from 'lodash'
import { _PENDING, SET_STATE, addDataToStore } from './actions'

// TODO cache expiration
export function cacheMiddleware (store) {
  return next => action => {
    if (action.type.endsWith(_PENDING)) return next(action)

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
        return Promise.resolve({...action, payload: hit, cacheHit: true})
      }
    } else {
      if (hit && !requiredProp || has(hit, requiredProp)) {
        debug(`cache hit: ${bucket}[${id}]`)
        return Promise.resolve({...action, payload: hit, cacheHit: true})
      }
    }

    return next(action)
  }
}

export const addDataToStoreMiddleware = store => next => action => {
  const { type, payload, error, meta } = action
  if (type.endsWith(_PENDING) || isPromise(payload)) return next(action)

  if (!error && meta && meta.addDataToStore) {
    forEach(meta.addDataToStore, (fn, bucket) => {
      const data = fn(payload)
      if (data) store.dispatch(addDataToStore(bucket, data, type))
    })
  }

  return next(action)
}

export function apiMiddleware (req) {
  return store => next => action => {
    const { payload, meta } = action
    if (!payload || !payload.api) return next(action)

    const { path, params, method } = payload
    const cookie = req && req.headers.cookie
    let promise = fetchJSON(path, params, {method, cookie})

    if (meta && meta.then) {
      promise = promise.then(meta.then)
    }

    return next({...action, payload: promise})
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
      store.dispatch({...action, type: type + _PENDING, payload: null})
    }
    return next(action)
  }
}

export function optimisticMiddleware (store) {
  return next => action => {
    let { payload, meta } = action
    if (get(meta, 'optimistic') && isPromise(payload)) {
      const prevState = store.getState()
      action.payload = action.payload.then(
        result => result,
        error => {
          store.dispatch({type: SET_STATE, payload: prevState})
          throw error
        }
      )
    }
    return next(action)
  }
}
