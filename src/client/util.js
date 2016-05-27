import qs from 'querystring'
import { isEmpty, omit, omitBy } from 'lodash'
import randomstring from 'randomstring'

// if you need to check whether the client is a mobile device from the server
// side, use the isMobile reducer in the store
export const isMobile = () => {
  if (typeof window === 'undefined') return
  return document.documentElement.clientWidth < 768 // Bootstrap's screen-sm-min
}

export function isiOSApp () {
  return window.navigator.userAgent.indexOf('Hylo-App') > -1
}

export function isAndroidApp () {
  return typeof AndroidBridge !== 'undefined'
}

export function calliOSBridge (message, callback) {
  var randomName = () => {
    return randomstring.generate({length: 10, charset: 'alphabetic'})
  }

  if (callback) {
    const callbackIdentifier = randomName()
    if (!window.iOSCallbacks) {
      window.iOSCallbacks = {}
    }
    window.iOSCallbacks[callbackIdentifier] = callback
    message.callbackPath = `window.iOSCallbacks.${callbackIdentifier}`
  }
  window.webkit.messageHandlers.hylo.postMessage(message)
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
