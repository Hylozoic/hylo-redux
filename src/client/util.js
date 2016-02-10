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

export function makeUrl (path, params) {
  params = omitBy(params, x => !x)
  return `${path}${!isEmpty(params) ? '?' + qs.stringify(params) : ''}`
}

export function locationWithoutParams (...names) {
  let params = qs.parse(window.location.search.replace(/^\?/, ''))
  return makeUrl(window.location.pathname, omit(params, ...names))
}
