import 'babel-core/polyfill'
import React from 'react'
import { render } from 'react-dom'
import { configureStore } from '../store'
import createHistory from 'history/lib/createBrowserHistory'
import { Provider } from 'react-redux'
import { match, Router } from 'react-router'
import makeRoutes from '../routes'
import { syncReduxAndRouter } from 'redux-simple-router'
import { getPrefetchedData, getDeferredData } from 'react-fetcher'
import { debug } from '../util/logging'
import { localsForPrefetch } from '../util/universal'
import { get, isEqual } from 'lodash'
import { setManifest } from '../util/assets'
import { identify } from '../util/analytics'
import fbAsyncInit from './fbAsyncInit'
import setupSegment from './segment'
import trackClickthrough from './clickthrough'

const store = configureStore(window.INITIAL_STATE)
const routes = makeRoutes(store)
const history = createHistory()
syncReduxAndRouter(history, store)
setManifest(window.ASSET_MANIFEST)
setupSegment()

var prevLocation = null

history.listen(location => {
  match({routes, location}, (error, redirectLocation, renderProps) => {
    if (redirectLocation) {
      history.replaceState({}, redirectLocation.pathname + redirectLocation.search)
      return
    }

    if (error) return console.error(error)

    // WEIRD: when the logout action is dispatched, it triggers
    // a history event even though the location didn't change.
    // i don't know why that happens, but we work around it here
    // by comparing the new location to the previous one.
    if (prevLocation && location.pathname === prevLocation.pathname &&
      isEqual(location.search, prevLocation.search)) {
      debug('suppressed a redundant history event')
      return
    }

    identify(get(store.getState(), 'people.current'))
    window.analytics.page()

    const components = renderProps.routes.map(r => r.component)
    const locals = localsForPrefetch(renderProps, store)

    // don't prefetch for the first route after page load, because it's all been
    // loaded on the server already
    Promise.resolve(prevLocation && getPrefetchedData(components, locals))
    .then(() => getDeferredData(components, locals))
    .then(() => prevLocation = location)
  })
})

fbAsyncInit()
trackClickthrough()

const component = (
  <Provider store={store}>
    <Router routes={routes} history={history}/>
  </Provider>
)

render(component, document.getElementById('app'))
