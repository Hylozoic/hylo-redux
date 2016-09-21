import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { configureStore } from '../store'
import { Provider } from 'react-redux'
import { Router, browserHistory } from 'react-router'
import makeRoutes from '../routes'
import { setManifest } from '../util/assets'
import fbAsyncInit from './fbAsyncInit'
import setupSegment from './segment'
import trackClickthrough from './clickthrough'
import updateLocation from './updateLocation'
import polyfills from './polyfills'
import { init as initLazyLoader } from '../components/LazyLoader'

const { history, store } = configureStore(window.INITIAL_STATE, {history: browserHistory})
const routes = makeRoutes(store)
setManifest(window.ASSET_MANIFEST)
setupSegment()
fbAsyncInit()
trackClickthrough()
polyfills()
initLazyLoader()
history.listen(updateLocation({store, routes, history}))

const component = (
  <Provider store={store}>
    <Router routes={routes} history={history}/>
  </Provider>
)

render(component, document.getElementById('app'))
