import config from '../../config'
import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import Html from '../containers/Html'
import { promisify } from 'bluebird'
import makeRoutes from '../routes'
import { configureStore } from '../store'
import { Provider } from 'react-redux'
import { match, RoutingContext } from 'react-router'
import createHistory from 'history/lib/createMemoryHistory'
import { syncReduxAndRouter } from 'redux-simple-router'
import { getPrefetchedData } from 'react-fetcher'
import { cyan, yellow } from 'chalk'

const matchPromise = promisify(match, {multiArgs: true})

export default function (req, res) {
  console.log('\n' + cyan(`${req.method} ${req.originalUrl}`))

  const store = configureStore({}, req)
  const routes = makeRoutes(store)
  const history = createHistory()

  matchPromise({routes, location: req.originalUrl})
  .then(([redirectLocation, renderProps]) => {
    if (redirectLocation) {
      res.redirect(302, redirectLocation.pathname + redirectLocation.search)
      return
    }

    if (!renderProps) {
      res.status(404).send('Not found')
      return
    }

    renderApp(res, renderProps, history, store)
    .then(html => res.status(200).send(html))
  })
  .catch(error => {
    res.status(500).send(error.message)
  })
}

function renderApp (res, renderProps, history, store) {
  const components = renderProps.routes.map(r => r.component)
  const locals = {
    path: renderProps.location.pathname,
    query: renderProps.location.query,
    params: renderProps.params,
    dispatch: store.dispatch
  }

  return getPrefetchedData(components, locals)
  .then(() => {
    // if this runs before getPrefetchedData it hangs -- infinite loop?
    history.transitionTo(renderProps.location)
    syncReduxAndRouter(history, store)

    console.log(yellow('rendering'))
    const markup = renderToString(
      <Provider store={store}>
        <RoutingContext location='history' {...renderProps}/>
      </Provider>
    )

    const page = React.createElement(Html, {
      markup: markup,
      state: `window.INITIAL_STATE=${JSON.stringify(store.getState())}`,
      cssBundle: config.cssBundle,
      jsBundle: config.jsBundle
    })

    return renderToStaticMarkup(page)
  })
}
