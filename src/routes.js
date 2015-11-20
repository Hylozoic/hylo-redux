import React from 'react'
import { Route, IndexRoute } from 'react-router'
import Home from './components/Home'
import Login from './containers/Login'
import App from './containers/App'
import UserProfile from './containers/UserProfile'

export default function makeRoutes (store) {
  return <Route path='/' component={App}>
    <IndexRoute component={Home}/>
    <Route path='login' component={Login}/>
    <Route path='u/:userId' component={UserProfile}/>
  </Route>
}
