import qs from 'querystring'

export const localsForPrefetch = ({ location, params, routes }, store) => {
  return {
    location,
    params,
    store,
    path: location.pathname,
    dispatch: store.dispatch,
    currentUser: store.getState().people.current,

    // for some reason location.query is correct on the server, but
    // on the client, it doesn't get set until after getPrefetchedData.
    // so we manually set it here.
    query: qs.parse(location.search.replace(/^\?/, '')),

    // ideally we'd provide only the corresponding route segment to the
    // component -- I think this is available in a later version of
    // react-fetcher
    routes
  }
}
