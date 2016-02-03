import dotenv from 'dotenv'
import chai from 'chai'
process.env.NODE_ENV = 'test'

dotenv.load({path: './.env.test', silent: true})

chai.use(require('chai-spies'))
global.expect = chai.expect
global.spy = chai.spy

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
    },
    redux: {
      store: function (state) {
        return {
          subscribe: () => {},
          dispatch: () => {},
          getState: () => ({...state})
        }
      }
    }
  }
}
