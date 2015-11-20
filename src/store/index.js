import { createStore, applyMiddleware, compose } from 'redux'
import promiseMiddleware from 'redux-promise'
import rootReducer from '../reducers'
import createLogger from 'redux-logger'
import { compact } from 'lodash'
import { serverLogger, apiMiddleware } from '../middleware'

export function configureStore (initialState, req) {
  const isServer = typeof window === 'undefined'

  var middleware = compact([
    isServer && serverLogger,
    apiMiddleware(req),
    promiseMiddleware,
    !isServer && createLogger({collapsed: true})
  ])

  const store = compose(
    applyMiddleware(...middleware)
  )(createStore)(rootReducer, initialState)

  if (module.onReload) {
    module.onReload(() => {
      const nextRootReducer = require('../reducers/index')
      store.replaceReducer(nextRootReducer)
      return true
    })
  }

  return store
}
