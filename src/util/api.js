import { upstreamHost } from '../config'
import fetch from 'isomorphic-fetch'
import { get } from 'lodash/fp'

export const HOST = typeof window === 'undefined'
  ? upstreamHost
  : window.location.origin

export const fetchJSON = (path, params, options = {}) =>
  fetch((options.host || HOST) + path, {
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
    let { status, statusText, url } = resp
    if (status === 200) return resp.json()
    return resp.text().then(body => {
      let error = new Error(body)
      error.response = {status, statusText, url, body}
      throw error
    })
  })

export const responseMissingTagDescriptions = action => {
  if (!action.error) return
  const response = JSON.parse(get('payload.response.body', action) || '{}')
  return !!response.tagsMissingDescriptions
}
