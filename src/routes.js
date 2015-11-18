import React from 'react'
import { Route, IndexRoute } from 'react-router'
import Home from './components/Home'
import About from './components/About'
import Login from './containers/Login'
import App from './containers/App'

export default (
  <Route path='/' component={App}>
    <IndexRoute component={Home}/>
    <Route path='about' component={About}/>
    <Route path='login' component={Login}/>
  </Route>
)
