import React from 'react'
import nock from 'nock'
import { get, has, mapValues, omit } from 'lodash'

export const createElement = (componentClass, props, context) => {
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

// this is basically setTimeout promisified
export const wait = (millis, callback) =>
  new Promise((resolve, _) => setTimeout(() => resolve(callback()), millis))

export const spyify = (object, methodName) => {
  object['_original' + methodName] = object[methodName]
  object[methodName] = spy(object[methodName])
}

export const unspyify = (object, methodName) => {
  object[methodName] = object['_original' + methodName]
}

export const mockActionResponse = (action, resp) => {
  const { HOST } = require('../../src/util/api')
  let { method, path, api } = action.payload || {}
  if (!api) {
    throw new Error("Can't use mockActionResponse with a non-API action")
  }
  method = (method || 'get').toLowerCase()
  nock(HOST)[method](path).reply(200, resp)
}
