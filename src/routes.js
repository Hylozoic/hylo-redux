import React from 'react'
import { Route, IndexRoute } from 'react-router'
import Home from './components/Home'
import Login from './containers/Login'
import App from './containers/App'
import UserProfile from './containers/UserProfile'
import CommunityProfile from './containers/CommunityProfile'
import CommunityPosts from './containers/community/CommunityPosts'
import CommunityEvents from './containers/community/CommunityEvents'
import AboutCommunity from './containers/community/AboutCommunity'
import { debug } from './util/logging'

const requireLogin = store => (nextState, replaceState) => {
  if (!store.getState().users.current) {
    debug('redirecting to login')
    replaceState({}, `/login?next=${nextState.location.pathname}`)
  }
}

export default function makeRoutes (store) {
  return <Route path='/' component={App}>
    <IndexRoute component={Home}/>
    <Route path='login' component={Login}/>
    <Route path='u/:userId' component={UserProfile} onEnter={requireLogin(store)}/>
    <Route path='c/:id' component={CommunityProfile} onEnter={requireLogin(store)}>
      <IndexRoute component={CommunityPosts}/>
      <Route path='events' component={CommunityEvents}/>
      <Route path='about' component={AboutCommunity}/>
    </Route>
  </Route>
}
