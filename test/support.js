import dotenv from 'dotenv'
import chai from 'chai'
import React from 'react'
import { get, has, mapValues, omit } from 'lodash'
import nock from 'nock'
process.env.NODE_ENV = 'test'

dotenv.load({path: './.env.test', silent: true})

chai.use(require('chai-spies'))
global.expect = chai.expect
global.spy = chai.spy

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

export const helpers = {
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
  },

  mockActionResponse: (action, resp) => {
    const { HOST } = require('../src/util/api')
    let { method, path } = action
    method = (method || 'get').toLowerCase()
    nock(HOST)[method](path).reply(200, resp)
  }
}

export mocks from './support/mocks'
