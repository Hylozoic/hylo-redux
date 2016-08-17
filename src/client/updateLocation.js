import { match } from 'react-router'
import { getPrefetchedData, getDeferredData } from 'react-fetcher'
import { debug } from '../util/logging'
import { get, isEqual } from 'lodash'
import { pick } from 'lodash/fp'
import { localsForPrefetch } from '../util/universal'
import { identify } from '../util/analytics'
import { calliOSBridge } from './util'

var prevLocation = null

const updateLocation = opts => location => {
  const { store, routes, history } = opts

  match({routes, location}, (error, redirectLocation, renderProps) => {
    if (redirectLocation) {
      history.replace(redirectLocation)
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

    calliOSBridge({type: 'navigated', pathname: location.pathname})

    Promise.resolve(prevLocation && getPrefetchedData(components, locals))
    .then(() => getDeferredData(components, locals))
    .then(() => prevLocation = location)
  })
}

export default updateLocation
