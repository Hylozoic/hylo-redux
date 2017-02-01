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
      const { wrappedInstance } = this.refs
      return get(wrappedInstance, 'getWrappedInstance')
        ? wrappedInstance.getWrappedInstance()
        : wrappedInstance
    }
  }

  return React.createElement(Wrapper)
}

// this is just setTimeout promisified
export const wait = (millis, cb) =>
  new Promise((resolve, reject) =>
    setTimeout(() => resolve(cb ? cb() : null), millis))

const isSpy = (func) => !!func.__spy

export const spyify = (object, methodName, func) => {
  if (!isSpy(object[methodName])) object['_original' + methodName] = object[methodName]

  object[methodName] = spy((...args) => {
    const ret = object['_original' + methodName](...args)
    if (func) func(...args, ret)
    return ret
  })
}

export const mockify = (object, methodName, func) => {
  object['_original' + methodName] = object[methodName]
  object[methodName] = spy(func)
}

export const unspyify = (object, methodName) => {
  object[methodName] = object['_original' + methodName]
}

export const mockActionResponse = (action, resp, statusCode = 200) => {
  const { HOST } = require('../../src/util/api')
  let { method, path, api } = action.payload || {}
  if (!api) {
    throw new Error("Can't use mockActionResponse with a non-API action")
  }
  method = (method || 'get').toLowerCase()
  return nock(HOST)[method](path).reply(statusCode, resp)
}
