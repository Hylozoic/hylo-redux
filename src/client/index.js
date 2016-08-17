import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { configureStore } from '../store'
import { Provider } from 'react-redux'
import { Router, browserHistory } from 'react-router'
import makeRoutes from '../routes'
import { syncHistoryWithStore } from 'react-router-redux'
import { setManifest } from '../util/assets'
import fbAsyncInit from './fbAsyncInit'
import setupSegment from './segment'
import trackClickthrough from './clickthrough'
import updateLocation from './updateLocation'

const store = configureStore(window.INITIAL_STATE)
const routes = makeRoutes(store)
const history = syncHistoryWithStore(browserHistory, store)
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
