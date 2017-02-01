import { inspect } from 'util'
import { fetchJSON } from './util/api'
import { debug } from './util/logging'
import { blue } from 'chalk'
import { find, forIn, values, get, has, omit } from 'lodash'
import { addDataToStore } from './actions'
import {
  _PENDING,
  SET_STATE
} from './actions/constants'

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
      if (!offset) offset = 0
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
    forIn(meta.addDataToStore, (fn, bucket) => {
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

const inspectAction = (action, mergeAttrs) =>
  inspect({...mergeAttrs, ...omit(action, 'payload')})
  .replace(/type: '([\w@/_]+)'/, (match, $1) => `type: '${blue($1)}'`)

export function serverLogger (store) {
  return next => action => {
    let { payload } = action

    if (!payload || !payload.api) {
      debug(inspectAction(action))
    } else {
      debug(inspectAction(action, {api: true}))
    }

    return next(action)
  }
}

function isPromise (value) {
  return value && typeof value.then === 'function'
}

export function pendingMiddleware (store) {
  return next => action => {
    const { type, payload } = action
    if (isPromise(payload)) {
      store.dispatch({...action, type: type + _PENDING, payload: null})
    }
    return next(action)
  }
}

export function timeoutMiddleware (store) {
  return next => action => {
    const { payload, meta } = action
    if (isPromise(payload) && get(meta, 'timeout')) {
      action.payload = new Promise((resolve, reject) => {
        const fail = setTimeout(() =>
          reject(new Error('timeout')), meta.timeout)

        const clearAndDo = action => result => {
          clearTimeout(fail)
          action(result)
        }

        payload.then(clearAndDo(resolve), clearAndDo(reject))
      })
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
