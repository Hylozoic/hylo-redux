import { upstreamHost } from '../../config'
import fetch from 'isomorphic-fetch'

export const HOST = typeof window === 'undefined'
  ? upstreamHost
  : window.location.origin

export const fetchJSON = (path, params, options = {}) => {
  return fetch((options.host || HOST) + path, {
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
