require('./support')

require('glob').sync('test/**/*.test.js').forEach(file => {
  let path = file.replace(/^test/, '.').replace(/\.js$/, '')
  require(path)
})
