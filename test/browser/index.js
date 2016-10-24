require('./support')

require('glob').sync('test/browser/**/*.test.js').forEach(file => {
  let path = file.replace(/^test\/browser/, '.').replace(/\.js$/, '')
  require(path)
})
