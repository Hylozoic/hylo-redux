import { createStore, applyMiddleware, compose } from 'redux'
import promiseMiddleware from 'redux-promise'
import rootReducer from '../reducers'
import createLogger from 'redux-logger'

const serverLogger = store => next => action => {
  console.log('action!', action.type)
  console.log('- prev state', store.getState())
  let result = next(action)
  console.log('- next state', store.getState())
  return result
}

export function configureStore (initialState) {
  var middleware = [promiseMiddleware]

  if (typeof window !== 'undefined') {
    middleware.push(createLogger({collapsed: true}))
  } else {
    middleware.push(serverLogger)
  }
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
