import { createStore, applyMiddleware, compose } from 'redux'
import promiseMiddleware from 'redux-promise'
import { routerMiddleware, syncHistoryWithStore } from 'react-router-redux'
import rootReducer from '../reducers'
import createLogger from 'redux-logger'
import { compact, flatten } from 'lodash'
import {
  serverLogger, apiMiddleware, cacheMiddleware, pendingMiddleware,
  optimisticMiddleware, timeoutMiddleware, addDataToStoreMiddleware
} from '../middleware'
import createHistory from 'history/lib/createMemoryHistory'
import { useRouterHistory } from 'react-router'
import { environment } from '../config'

export function configureStore (initialState, opts = {}) {
  const isServer = typeof window === 'undefined'
  const isDev = environment === 'development'
  const history = opts.history || useRouterHistory(createHistory)()

  var middleware = compact(flatten([
    opts.middleware,
    routerMiddleware(history),
    isServer && serverLogger,
    cacheMiddleware,
    apiMiddleware(opts.request),
    addDataToStoreMiddleware,
    optimisticMiddleware,
    pendingMiddleware,
    timeoutMiddleware,
    promiseMiddleware,
    !isServer && isDev && createLogger({collapsed: true})
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
