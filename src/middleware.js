import { inspect } from 'util'
import { fetchJSON } from './util/api'
import { debug } from './util/logging'
import { blue } from 'chalk'
import { find, values, get, has, omit } from 'lodash'
import { _PENDING, SET_STATE } from './actions'

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
        return Promise.resolve({...action, cacheHit: true})
      }
    } else {
      if (hit && !requiredProp || has(hit, requiredProp)) {
        debug(`cache hit: ${bucket}[${id}]`)
        return Promise.resolve({...action, cacheHit: true})
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

      // TODO
      // here, we could check for a flag in the action that indicates that the
      // API response will contain entities that should be added to the store
      // according to a standard pattern.
      //
      // we could respond to this flag by dispatching another action with a type
      // like ADD_DATA_TO_STORE. this would simplify the reducers, because they
      // wouldn't have to listen to a dozen different actions, just one.
      //
      // the flag could have values like "append", "merge", "replace", etc. to
      // trigger different behavior.

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
      store.dispatch({...action, type: type + _PENDING, payload: null})
    }
    return next(action)
  }
}

export function optimisticMiddleware (store) {
  return next => action => {
    let { payload, meta } = action
    console.log('calling optimistic midddleware with', action.type)
    if (get(meta, 'optimistic') && isPromise(payload)) {
      const prevState = store.getState()
      console.log("this one's optimistic")
      console.log('prevState', prevState)
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
