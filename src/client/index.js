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

history.listen(location => {
  match({routes, location}, (error, redirectLocation, renderProps) => {
    const components = renderProps.routes.map(r => r.component)
    const locals = {
      path: renderProps.location.pathname,
      query: renderProps.location.query,
      params: renderProps.params,
      dispatch: store.dispatch
    }
    getPrefetchedData(components, locals)
    .then(() => getDeferredData(components, locals))
  })
})

const component = (
  <Provider store={store}>
    <Router routes={routes} history={history}/>
  </Provider>
)

render(component, document.getElementById('app'))
