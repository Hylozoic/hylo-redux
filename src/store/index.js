import { createStore, applyMiddleware, compose } from 'redux'
import promiseMiddleware from 'redux-promise'
import { routerMiddleware } from 'react-router-redux'
import rootReducer from '../reducers'
import createLogger from 'redux-logger'
import { compact, flatten } from 'lodash'
import {
  serverLogger, apiMiddleware, cacheMiddleware, pendingPromiseMiddleware,
  optimisticMiddleware, addDataToStoreMiddleware
} from '../middleware'
import { syncHistoryWithStore } from 'react-router-redux'
import createHistory from 'history/lib/createMemoryHistory'
import { useRouterHistory } from 'react-router'

export function configureStore (initialState, opts = {}) {
  const isServer = typeof window === 'undefined'
  const isTesting = process.env.NODE_ENV === 'test'
  const history = opts.history || useRouterHistory(createHistory)()

  var middleware = compact(flatten([
    opts.middleware,
    routerMiddleware(history),
    isServer && serverLogger,
    cacheMiddleware,
    apiMiddleware(opts.request),
    addDataToStoreMiddleware,
    optimisticMiddleware,
    pendingPromiseMiddleware,
    promiseMiddleware,
    !isServer && !isTesting && createLogger({collapsed: true})
  ]))

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

  return {store, history: syncHistoryWithStore(history, store)}
}
