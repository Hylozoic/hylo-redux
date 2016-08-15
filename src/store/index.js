import { createStore, applyMiddleware, compose } from 'redux'
import promiseMiddleware from 'redux-promise'
import rootReducer from '../reducers'
import createLogger from 'redux-logger'
import { compact } from 'lodash'
import {
  serverLogger, apiMiddleware, cacheMiddleware, pendingPromiseMiddleware,
  optimisticMiddleware
} from '../middleware'

export function configureStore (initialState, req) {
  const isServer = typeof window === 'undefined'

  var middleware = compact([
    isServer && serverLogger,
    cacheMiddleware,
    apiMiddleware(req),
    optimisticMiddleware,
    pendingPromiseMiddleware,
    promiseMiddleware,
    !isServer && createLogger({collapsed: true})
  ])

  const store = compose(
    applyMiddleware(...middleware),
    !isServer && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
  )(createStore)(rootReducer, initialState)

  if (module.onReload) {
    module.onReload(() => {
      const nextReducer = require('../reducers/index')
      store.replaceReducer(nextReducer.default || nextReducer)
      return true
    })
  }

  return store
}
