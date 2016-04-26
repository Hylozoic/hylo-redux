import qs from 'querystring'
import { isEmpty, omit, omitBy } from 'lodash'

export function isiOSApp () {
  return window.navigator.userAgent.indexOf('Hylo-App') > -1
}

export function isAndroidApp () {
  return typeof AndroidBridge !== 'undefined'
}

/* usage:
 * var connectWebViewJavascriptBridge = require('webViewJavascriptBridge')
 * connectWebViewJavascriptBridge(function(bridge) {
 *   bridge.send(...)
 * }
 */
export function connectWebViewBridge (callback) {
  if (window.WebViewJavascriptBridge) {
    callback(window.WebViewJavascriptBridge)
  } else {
    document.addEventListener('WebViewJavascriptBridgeReady', function () {
      callback(window.WebViewJavascriptBridge)
    }, false)
  }
}

// FIXME this isn't client-specific
export function makeUrl (path, params) {
  params = omitBy(params, x => !x)
  return `${path}${!isEmpty(params) ? '?' + qs.stringify(params) : ''}`
}

export function locationWithoutParams (...names) {
  let params = qs.parse(window.location.search.replace(/^\?/, ''))
  return makeUrl(window.location.pathname, omit(params, ...names))
}

export const loadScript = url => {
  var script = document.createElement('script')
  script.src = url
  const promise = new Promise((resolve, reject) => {
    script.onload = resolve
  })
  document.head.appendChild(script)
  return promise
}

export const loadStylesheet = url => {
  const head = document.getElementsByTagName('head')[0]
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.type = 'text/css'
  link.href = url
  link.media = 'all'
  head.appendChild(link)
}
