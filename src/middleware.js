import { inspect } from 'util'
import { omit } from 'lodash'
import { fetchJSON } from './util/api'

export function cacheMiddleware (store) {
  return next => action => {
    let { type, meta } = action
    let { bucket, id } = (meta || {}).cache || {}
    if (bucket && id) {
      // TODO cache expiration
      var hit = store.getState()[bucket][id]
      if (hit) {
        console.log(`cache hit: ${bucket} ${id}`)
        return next({type, payload: hit, meta: {cache: {hit: true}}})
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

    // ignore api actions, which will be transformed
    // by apiMiddleware and promiseMiddleware
    if (!payload || !payload.api) {
      console.log('action:', inspect(omit(action, 'payload')))
    } else {
      console.log('action:', inspect({api: true, ...omit(action, 'payload')}))
    }

    return next(action)
  }
}
