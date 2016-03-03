require('./support')

require('glob').sync('test/client/**/*.test.js').forEach(file => {
  let path = file.replace(/^test\/client/, '.').replace(/\.js$/, '')
  require(path)
})
