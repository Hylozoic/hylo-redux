const jsdom = require('jsdom')
global.document = jsdom.jsdom('<!doctype html><html><body></body></html>')
global.window = document.defaultView

for (let key in window) {
  if (!window.hasOwnProperty(key)) continue
  if (key in global) continue
  global[key] = window[key]
}

global.tinymce = {
  init: () => {}
}

// needs to be required after the globals are declared, because they must be
// declared before React is loaded
require('../support')
