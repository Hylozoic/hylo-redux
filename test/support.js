import dotenv from 'dotenv'
import chai from 'chai'
import React from 'react'
import { get, has, mapValues, merge, omit } from 'lodash'
import { generate } from 'randomstring'
process.env.NODE_ENV = 'test'

dotenv.load({path: './.env.test', silent: true})

chai.use(require('chai-spies'))
global.expect = chai.expect
global.spy = chai.spy

const text = (length = 10) => generate({length, charset: 'alphabetic'})
const number = (range = 10000) => Math.floor(Math.random() * range)

// call store.transformAction(action.type, callback) in test setup if you want
// store.dispatch(action) to return a specific value
const mockReduxStore = function (state) {
  let dispatched = []
  let actionTransforms = {}

  return {
    subscribe: spy(() => {}),
    getState: () => ({...state}),
    dispatched,
    dispatch: spy(action => {
      dispatched.push(action)
      const callback = actionTransforms[action.type]
      return callback ? callback(action) : action
    }),
    transformAction: (actionType, response) => {
      actionTransforms[actionType] = response
    }
  }
}

const createElement = (componentClass, props, context) => {
  context = {
    dispatch: get(context, 'store.dispatch'),
    ...context
  }

  class Wrapper extends React.Component {
    static childContextTypes = mapValues(context, () => React.PropTypes.any)

    getChildContext () { return context }

    render () {
      this.renderedElement = React.createElement(componentClass, {
        ...omit(props, 'stateless'),
        ref: has(props, 'stateless') ? null : 'wrappedInstance'
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

  return React.createElement(Wrapper)
}

export default {
  helpers: {
    createElement,

    // this is basically setTimeout promisified
    wait: (millis, callback) =>
      new Promise((resolve, _) => setTimeout(() => resolve(callback()), millis)),

    spyify: (object, methodName) => {
      object['_original' + methodName] = object[methodName]
      object[methodName] = spy(object[methodName])
    },

    unspyify: (object, methodName) => {
      object[methodName] = object['_original' + methodName]
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
    event: function (attrs) {
      return merge({
        preventDefault: spy(() => {}),
        stopPropagation: spy(() => {})
      }, attrs)
    },
    redux: {
      store: mockReduxStore
    },
    models: {
      user: (attrs) => merge({
        id: number(),
        name: text()
      }, attrs)
    }
  }
}
