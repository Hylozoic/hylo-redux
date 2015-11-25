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

const store = configureStore(window.INITIAL_STATE)
const routes = makeRoutes(store)
const history = createHistory()
syncReduxAndRouter(history, store)

var prevLocation = null

history.listen(location => {
  match({routes, location}, (error, redirectLocation, renderProps) => {
    if (error) {
      console.error(error)
      return
    }

    // don't prefetch for the first route after page load,
    // because it's all been loaded on the server already
    if (!prevLocation) {
      prevLocation = location
      return
    }

    // WEIRD: when the logout action is dispatched, it triggers
    // a history event even though the location didn't change.
    // i don't know why that happens, but we work around it here
    // by comparing the new location to the previous one.
    if (location.pathname === prevLocation.pathname) {
      debug('suppressed a redundant history event')
      return
    }

    const components = renderProps.routes.map(r => r.component)
    const locals = localsForPrefetch(renderProps, store)
    
    getPrefetchedData(components, locals)
    .then(() => getDeferredData(components, locals))
    .then(() => prevLocation = location)
  })
})

const component = (
  <Provider store={store}>
    <Router routes={routes} history={history}/>
  </Provider>
)

render(component, document.getElementById('app'))
