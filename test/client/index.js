/*
Tests in this folder will be run in a mock client-side React environment. They
need to be run in isolation from other tests because mocking client-side React
requires "window" to be defined globally, but that confuses server-side tests.

http://jaketrent.com/post/testing-react-with-jsdom/
*/

require('../support')
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

require('glob').sync('test/client/**/*.test.js').forEach(file => {
  let path = file.replace(/^test\/client/, '.').replace(/\.js$/, '')
  require(path)
})
