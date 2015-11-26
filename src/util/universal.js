import qs from 'querystring'

export const localsForPrefetch = ({ location, params }, store) => ({
  params,
  path: location.pathname,
  dispatch: store.dispatch,
  currentUser: store.getState().people.current,

  // for some reason location.query is correct on the server, but
  // on the client, it doesn't get set until after getPrefetchedData.
  // so we manually set it here.
  query: qs.parse(location.search.replace(/^\?/, ''))
})
