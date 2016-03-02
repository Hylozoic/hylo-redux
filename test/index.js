require('./support')

require('glob').sync('test/**/*.test.js').forEach(file => {
  // skip client-side tests
  if (file.match(/^test\/client\//)) return

  let path = file.replace(/^test/, '.').replace(/\.js$/, '')
  require(path)
})
