export const localsForPrefetch = (renderProps, store) => ({
  path: renderProps.location.pathname,
  query: renderProps.location.query,
  params: renderProps.params,
  dispatch: store.dispatch,
  currentUser: store.getState().currentUser
})
