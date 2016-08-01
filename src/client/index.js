import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { configureStore } from '../store'
import createHistory from 'history/lib/createBrowserHistory'
import { Provider } from 'react-redux'
import { Router } from 'react-router'
import makeRoutes from '../routes'
import { syncReduxAndRouter } from 'redux-simple-router'
import { setManifest } from '../util/assets'
import fbAsyncInit from './fbAsyncInit'
import setupSegment from './segment'
import trackClickthrough from './clickthrough'
import updateLocation from './updateLocation'

const store = configureStore(window.INITIAL_STATE)
const routes = makeRoutes(store)
const history = createHistory()
syncReduxAndRouter(history, store)
setManifest(window.ASSET_MANIFEST)
setupSegment()
fbAsyncInit()
trackClickthrough()
history.listen(updateLocation({store, routes, history}))

const component = (
  <Provider store={store}>
    <Router routes={routes} history={history}/>
  </Provider>
)

render(component, document.getElementById('app'))
