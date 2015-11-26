import React from 'react'
import { Route, IndexRoute } from 'react-router'
import Home from './components/Home'
import Login from './containers/Login'
import App from './containers/App'
import { AllPosts, MyPosts, FollowedPosts } from './containers/home'
import PersonProfile from './containers/PersonProfile'
import CommunityProfile from './containers/CommunityProfile'
import CommunityPosts from './containers/community/CommunityPosts'
import CommunityMembers from './containers/community/CommunityMembers'
import CommunityEvents from './containers/community/CommunityEvents'
import AboutCommunity from './containers/community/AboutCommunity'
import PersonPosts from './containers/person/PersonPosts'
import AboutPerson from './containers/person/AboutPerson'
import { debug } from './util/logging'

const requireLogin = store => (nextState, replaceState) => {
  if (!store.getState().people.current) {
    debug('redirecting to login')
    replaceState({}, `/login?next=${nextState.location.pathname}`)
  }
}

export default function makeRoutes (store) {
  return <Route path='/' component={App}>
    <IndexRoute component={Home}/>
    <Route path='login' component={Login}/>
    <Route path='all-posts' component={AllPosts} onEnter={requireLogin(store)}/>
    <Route path='my-posts' component={MyPosts} onEnter={requireLogin(store)}/>
    <Route path='followed-posts' component={FollowedPosts} onEnter={requireLogin(store)}/>
    <Route path='u/:id' component={PersonProfile} onEnter={requireLogin(store)}>
      <IndexRoute component={PersonPosts}/>
      <Route path='about' component={AboutPerson}/>
    </Route>
    <Route path='c/:id' component={CommunityProfile} onEnter={requireLogin(store)}>
      <IndexRoute component={CommunityPosts}/>
      <Route path='members' component={CommunityMembers}/>
      <Route path='events' component={CommunityEvents}/>
      <Route path='about' component={AboutCommunity}/>
    </Route>
  </Route>
}
