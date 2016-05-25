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
import { cyan, red } from 'chalk'
import { info, debug } from '../util/logging'
import { fetchCurrentUser, setMobileDevice } from '../actions'
import { localsForPrefetch } from '../util/universal'
import { getManifest } from '../util/assets'
import { some, isEmpty, toPairs } from 'lodash'
import { parse } from 'url'
import MobileDetect from 'mobile-detect'

const matchPromise = promisify(match, {multiArgs: true})

const checkAPIErrors = ({ errors }) => {
  return some(toPairs(errors), ([key, { payload: { response } }]) => {
    if (!response) return false
    let { status, url } = response
    debug(red(`${key} caused ${status} at ${url}`))
    return true
  })
}

const getPath = location => location.pathname + location.search

export default function (req, res) {
  info(cyan(`${req.method} ${req.originalUrl}`))

  const store = configureStore({}, req)
  const routes = makeRoutes(store)
  const history = createHistory()
  const md = new MobileDetect(req.headers['user-agent'])
  if (md.mobile() && !md.tablet()) store.dispatch(setMobileDevice())

  return store.dispatch(fetchCurrentUser())
  .then(() => matchPromise({routes, location: req.originalUrl}))
  .then(([redirectLocation, renderProps]) => {
    if (redirectLocation) {
      return res.redirect(302, getPath(redirectLocation))
    }

    if (!renderProps) {
      return res.status(404).send('Not found')
    }

    return renderApp(res, renderProps, history, store)
    .then(app => {
      if (app.shouldRedirect) return res.redirect(302, app.shouldRedirect)

      const html = renderToStaticMarkup(app)
      res.status(200).send('<!DOCTYPE html>' + html)
    })
  })
  .catch(err => {
    res.errors = [err]
    res.setHeader('Content-Type', 'text/plain')
    const state = parse(req.url, true).query.verboseErrorPage
      ? JSON.stringify(store.getState(), null, 2)
      : ''
    res.status(500).send(`${err.stack}\n\n${state}`)
  })
}

function renderApp (res, renderProps, history, store) {
  const components = renderProps.routes.map(r => r.component)
  const locals = localsForPrefetch(renderProps, store)

  return getPrefetchedData(components, locals)
  .then(() => {
    const currentPath = getPath(renderProps.location)
    const state = store.getState()
    const { path } = state.routing

    // if this runs before getPrefetchedData it hangs -- infinite loop?
    history.transitionTo(renderProps.location)
    syncReduxAndRouter(history, store)

    // if navigate was called during prefetch, redirect.
    if (path && path !== currentPath) {
      return {shouldRedirect: path}
    }

    checkAPIErrors(state)
    if (!isEmpty(state.errors)) {
      res.errors = state.errors
    }

    const markup = renderToString(<Provider store={store}>
      <RoutingContext location='history' {...renderProps}/>
    </Provider>)

    return React.createElement(Html, {
      markup: markup,
      state: `window.INITIAL_STATE=${JSON.stringify(state).replace('</script>', '')}`,
      assetManifest: `window.ASSET_MANIFEST=${JSON.stringify(getManifest())}`,
      metaTags: state.metaTags
    })
  })
}
