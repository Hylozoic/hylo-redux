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

const store = configureStore(window.INITIAL_STATE)
const routes = makeRoutes(store)
const history = createHistory()
syncReduxAndRouter(history, store)

var prevLocation = {}

history.listen(location => {
  match({routes, location}, (error, redirectLocation, renderProps) => {
    if (error) {
      console.error(error)
      return
    }

    // WEIRD: when the logout action is dispatched, it triggers
    // a history event even though the location didn't change.
    // i don't know why that happens, but we work around it here
    // by comparing the new location to the previous one.
    if (location.pathname === prevLocation.pathname) {
      console.log('suppressed a redundant history event')
      return
    }

    const components = renderProps.routes.map(r => r.component)
    const locals = {
      path: renderProps.location.pathname,
      query: renderProps.location.query,
      params: renderProps.params,
      dispatch: store.dispatch
    }
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
