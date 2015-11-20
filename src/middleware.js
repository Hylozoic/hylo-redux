import fetch from 'isomorphic-fetch'
import { inspect } from 'util'
import { upstreamHost } from '../config'
import { omit } from 'lodash'

export function cacheMiddleware (store) {
  return next => action => {
    let { type, meta } = action
    let { bucket, id, level } = (meta || {}).cache || {}
    if (bucket && id) {
      // TODO cache expiration
      var hit = store.getState()[bucket][id]
      if (hit) {
        console.log(`${bucket} ${id}: cache hit`)
        return next({type, payload: hit, meta: {cache: {hit: true}}})
      }
    }
    return next(action)
  }
}

export function apiMiddleware (req) {
  return store => next => action => {
    let { type, payload } = action
    if (payload && payload.api) {
      let { path, params, method } = payload
      let cookie = req && req.headers.cookie
      let apiPromise = fetchJSON(path, params, {method, cookie})
      return next({type, payload: apiPromise})
    }
    return next(action)
  }
}

const host = typeof window === 'undefined'
  ? upstreamHost
  : window.location.origin

const fetchJSON = (path, params, options = {}) => {
  console.log('fetchJSON:', path)
  return fetch((options.host || host) + path, {
    method: options.method || 'get',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Cookie': options.cookie
    },
    credentials: 'same-origin',
    body: JSON.stringify(params)
  })
  .then(resp => {
    if (resp.status === 200) return resp
    return resp.text().then(text => {
      let error = new Error(text)
      error.response = resp
      throw error
    })
  })
  .then(resp => resp.json())
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
