import dotenv from 'dotenv'
dotenv.load({path: './.env.test'})

import chai from 'chai'
chai.use(require('chai-spies'))
global.expect = chai.expect
global.spy = chai.spy

require('glob').sync('test/**/*.test.js').forEach(file => {
  let path = file.replace(/^test/, '.').replace(/\.js$/, '')
  require(path)
})

export default {
  mocks: {
    request: function (path) {
      return {originalUrl: path, method: 'GET', headers: {}}
    },
    response: function () {
      let res = {
        headers: {},
        setHeader: spy((key, value) => res.headers[key] = value),
        status: spy(code => {
          res.statusCode = code
          return res
        }),
        send: spy(body => {
          res.body = body
          return res
        }),
        redirect: spy((code, path) => {
          res.statusCode = code
          res.redirectLocation = path
          return res
        })
      }
      return res
    }
  }
}
