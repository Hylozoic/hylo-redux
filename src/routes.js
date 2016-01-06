import React from 'react'
import { Route, IndexRoute } from 'react-router'
import Home from './components/Home'
import Signup from './containers/Signup'
import Login from './containers/Login'
import App from './containers/App'
import { AllPosts, MyPosts, FollowedPosts } from './containers/home'
import Projects from './containers/Projects'
import CommunityProfile from './containers/community/CommunityProfile'
import CommunityPosts from './containers/community/CommunityPosts'
import CommunityMembers from './containers/community/CommunityMembers'
import CommunityEvents from './containers/community/CommunityEvents'
import CommunityProjects from './containers/community/CommunityProjects'
import AboutCommunity from './containers/community/AboutCommunity'
import CommunitySettings from './containers/community/CommunitySettings'
import PersonProfile from './containers/person/PersonProfile'
import PersonPosts from './containers/person/PersonPosts'
import AboutPerson from './containers/person/AboutPerson'
import UserSettings from './containers/user/UserSettings'
import SinglePost from './containers/SinglePost'
import ProjectProfile from './containers/project/ProjectProfile'
import ProjectPosts from './containers/project/ProjectPosts'
import ProjectContributors from './containers/project/ProjectContributors'
import ProjectEditor from './containers/project/ProjectEditor'
import { debug } from './util/logging'

export default function makeRoutes (store) {
  const requireLogin = (nextState, replaceState) => {
    if (!store.getState().people.current) {
      debug('redirecting to login')
      replaceState({}, `/login?next=${nextState.location.pathname}`)
    }
  }

  return <Route path='/' component={App}>
    <IndexRoute component={Home}/>
    <Route path='signup' component={Signup}/>
    <Route path='login' component={Login}/>
    <Route path='settings' component={UserSettings} onEnter={requireLogin}/>
    <Route path='all-posts' component={AllPosts} onEnter={requireLogin}/>
    <Route path='my-posts' component={MyPosts} onEnter={requireLogin}/>
    <Route path='followed-posts' component={FollowedPosts} onEnter={requireLogin}/>
    <Route path='projects' component={Projects} onEnter={requireLogin}/>
    <Route path='u/:id' component={PersonProfile} onEnter={requireLogin}>
      <IndexRoute component={PersonPosts}/>
      <Route path='about' component={AboutPerson}/>
    </Route>
    <Route path='c/:id' component={CommunityProfile} onEnter={requireLogin}>
      <IndexRoute component={CommunityPosts}/>
      <Route path='members' component={CommunityMembers}/>
      <Route path='events' component={CommunityEvents}/>
      <Route path='projects' component={CommunityProjects}/>
      <Route path='about' component={AboutCommunity}/>
      <Route path='settings' component={CommunitySettings}/>
    </Route>
    <Route path='p/:id' component={SinglePost}/>
    <Route path='project/new' component={ProjectEditor} onenter={requireLogin}/>
    <Route path='project/edit/:id' component={ProjectEditor} onenter={requireLogin}/>
    <Route path='project/:id/:slug' component={ProjectProfile}>
      <IndexRoute component={ProjectPosts}/>
      <Route path='contributors' component={ProjectContributors}/>
    </Route>
  </Route>
}
