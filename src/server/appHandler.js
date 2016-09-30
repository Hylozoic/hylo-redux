import { browserSnippet, setTransactionNameFromProps } from './newrelic' // this line must be first
import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import Html from '../containers/Html'
import makeRoutes from '../routes'
import { configureStore } from '../store'
import { Provider } from 'react-redux'
import { match, RouterContext } from 'react-router'
import { getPrefetchedData } from 'react-fetcher'
import { cyan, red } from 'chalk'
import { info, debug } from '../util/logging'
import { fetchCurrentUser, setMobileDevice } from '../actions'
import { localsForPrefetch } from '../util/universal'
import { getManifest } from '../util/assets'
import { makeUrl } from '../util/navigation'
import { some, isEmpty, toPairs } from 'lodash'
import { flow, map } from 'lodash/fp'
import { parse } from 'url'
import MobileDetect from 'mobile-detect'
import { featureFlags } from '../config'

const checkAPIErrors = (res, errors) => {
  if (!isEmpty(errors)) res.errors = errors

  return some(toPairs(errors), ([key, { payload: { response } }]) => {
    if (!response) return false
    let { status, url } = response
    debug(red(`${key} caused ${status} at ${url}`))
    return true
  })
}

const getPath = ({ pathname, query }) => makeUrl(pathname, query)

const detectMobileDevice = (req, store) => {
  const md = new MobileDetect(req.headers['user-agent'])
  if (md.mobile() && !md.tablet()) store.dispatch(setMobileDevice())
}

const matchLocation = (req, store) =>
  new Promise((resolve, reject) => {
    match({routes: makeRoutes(store), location: req.originalUrl},
      (err, redirectLocation, props) =>
        err ? reject(err) : resolve([redirectLocation, props]))
  })

const prefetch = (props, store) =>
  getPrefetchedData(map('component', props.routes), localsForPrefetch(props, store))

const renderComponent = (props, store) =>
  renderToString(<Provider store={store}>
    <RouterContext location='history' {...props}/>
  </Provider>)

const createElement = state => markup =>
  React.createElement(Html, {
    markup,
    initNewRelic: browserSnippet(),
    state: `window.INITIAL_STATE=${JSON.stringify(state).replace('</script>', '')}`,
    assetManifest: `window.ASSET_MANIFEST=${JSON.stringify(getManifest())}`,
    featureFlags: `window.FEATURE_FLAGS=${JSON.stringify(featureFlags())}`,
    metaTags: state.metaTags
  })

export default function (req, res) {
  info(cyan(`${req.method} ${req.originalUrl}`))
  const { history, store } = configureStore({}, {request: req})
  detectMobileDevice(req, store)

  return store.dispatch(fetchCurrentUser())
  .then(() => matchLocation(req, store))
  .then(([redirectLocation, props]) => {
    if (redirectLocation) return res.redirect(302, getPath(redirectLocation))
    if (!props) return res.status(404).send('Not found')
    setTransactionNameFromProps(req, props)

    return prefetch(props, store).then(() => {
      const state = store.getState()

      // redirect if the navigate action was dispatched during prefetching
      const { pathname, query } = state.routing.locationBeforeTransitions || {}
      if (pathname && props.location.pathname !== pathname) {
        return res.redirect(302, makeUrl(pathname, query))
      }

      history.transitionTo(props.location)
      checkAPIErrors(res, state.errors)

      const html = flow(
        renderComponent,
        createElement(state),
        renderToStaticMarkup
      )(props, store)
      res.status(200).send('<!DOCTYPE html>' + html)
    })
  })
  .catch(err => {
    res.errors = [err]
    res.setHeader('Content-Type', 'text/plain')
    const state = parse(req.originalUrl, true).query.verboseErrorPage
      ? JSON.stringify(store.getState(), null, 2)
      : ''
    res.status(500).send(`${err.stack}\n\n${state}`)
  })
}
