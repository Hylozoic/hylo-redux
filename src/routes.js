import React from 'react'
import { Route, IndexRoute } from 'react-router'
import Home from './components/Home'
import Login from './containers/Login'
import App from './containers/App'
import UserProfile from './containers/UserProfile'
import CommunityProfile from './containers/CommunityProfile'
import CommunityPosts from './containers/community/CommunityPosts'

export default function makeRoutes (store) {
  return <Route path='/' component={App}>
    <IndexRoute component={Home}/>
    <Route path='login' component={Login}/>
    <Route path='u/:userId' component={UserProfile}/>
    <Route path='c/:slug' component={CommunityProfile}>
      <IndexRoute component={CommunityPosts}/>
    </Route>
  </Route>
}
