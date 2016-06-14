const jsdom = require('jsdom')
global.document = jsdom.jsdom('<!doctype html><html><body></body></html>')
global.window = document.defaultView
window.tinymce = {
  init: () => {},
  EditorManager: {
    editors: []
  }
}

for (let key in window) {
  if (!window.hasOwnProperty(key)) continue
  if (key in global) continue
  global[key] = window[key]
}

import chai from 'chai'
chai.use(require('chai-spies'))
window.analytics = {
  track: chai.spy(() => {})
}

// if tests want to set up spies for window methods, they can restore the
// original behavior using these
window._originalAlert = window.alert
window._originalConfirm = window.confirm

// needs to be required after the globals are declared, because they must be
// declared before React is loaded
require('../support')
