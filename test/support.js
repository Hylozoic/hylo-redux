import dotenv from 'dotenv'
import chai from 'chai'
import { Component, createElement, PropTypes } from 'react'
import { mapValues, omit } from 'lodash'
process.env.NODE_ENV = 'test'

dotenv.load({path: './.env.test', silent: true})

chai.use(require('chai-spies'))
global.expect = chai.expect
global.spy = chai.spy

export default {
  helpers: {
    createElement: (componentClass, props, context) => {
      class Wrapper extends Component {
        static childContextTypes = mapValues(context, () => PropTypes.any)

        getChildContext () { return context }

        render () {
          this.renderedElement = createElement(componentClass, {
            ...omit(props, 'stateless'),
            ref: props.stateless ? null : 'wrappedInstance'
          })
          return this.renderedElement
        }

        getWrappedInstance () {
          if (this.refs.wrappedInstance && this.refs.wrappedInstance.getWrappedInstance) {
            return this.refs.wrappedInstance.getWrappedInstance()
          }
          return this.refs.wrappedInstance
        }
      }

      return createElement(Wrapper)
    }
  },
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
          subscribe: spy(() => {}),
          dispatch: spy(() => {}),
          getState: () => ({...state})
        }
      }
    }
  }
}
