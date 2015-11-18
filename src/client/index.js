import 'babel-core/polyfill'
import React from 'react'
import { render } from 'react-dom'
import { configureStore } from '../store'
import createHistory from 'history/lib/createBrowserHistory'
import { Provider } from 'react-redux'
import { Router } from 'react-router'
import routes from '../routes'
import { syncReduxAndRouter } from 'redux-simple-router'

const initialState = window.INITIAL_STATE
const history = createHistory()
const store = configureStore(initialState)
const rootElement = document.getElementById('app')
const component = (
  <Provider store={store}>
    <Router routes={routes} history={history}/>
  </Provider>
)

syncReduxAndRouter(history, store)
render(component, rootElement)
