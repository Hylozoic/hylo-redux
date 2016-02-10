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
import CommunityEditor from './containers/community/CommunityEditor'
import CommunityInvitations from './containers/community/CommunityInvitations'
import CommunityJoinForm from './containers/community/CommunityJoinForm'
import CommunityJoinLinkHandler from './containers/community/CommunityJoinLinkHandler'
import InvitationHandler from './containers/community/InvitationHandler'
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
import ProjectInvite from './containers/project/ProjectInvite'
import ProjectEditor from './containers/project/ProjectEditor'
import NetworkProfile from './containers/network/NetworkProfile'
import NetworkPosts from './containers/network/NetworkPosts'
import NetworkMembers from './containers/network/NetworkMembers'
import NetworkAbout from './containers/network/NetworkAbout'
import NetworkCommunities from './containers/network/NetworkCommunities'
import NetworkEditor from './containers/network/NetworkEditor'
import Notifications from './containers/Notifications'
import { debug } from './util/logging'
import { makeUrl } from './client/util'

export default function makeRoutes (store) {
  const requireLogin = (options = {}) => (nextState, replaceState) => {
    let { startAtSignup, addParams } = options
    if (!store.getState().people.current) {
      let start = startAtSignup ? 'signup' : 'login'
      debug(`redirecting to ${start}`)

      let params = {
        next: nextState.location.pathname,
        ...(addParams ? addParams(nextState) : null)
      }

      replaceState({}, makeUrl(`/${start}`, params))
    }
  }

  return <Route path='/' component={App}>
    <IndexRoute component={Home}/>
    <Route path='signup' component={Signup}/>
    <Route path='login' component={Login}/>
    <Route path='settings' component={UserSettings} onEnter={requireLogin()}/>
    <Route path='all-posts' component={AllPosts} onEnter={requireLogin()}/>
    <Route path='my-posts' component={MyPosts} onEnter={requireLogin()}/>
    <Route path='followed-posts' component={FollowedPosts} onEnter={requireLogin()}/>
    <Route path='projects' component={Projects} onEnter={requireLogin()}/>
    <Route path='notifications' component={Notifications} onEnter={requireLogin()}/>
    <Route path='u/:id' component={PersonProfile} onEnter={requireLogin()}>
      <IndexRoute component={PersonPosts}/>
      <Route path='about' component={AboutPerson}/>
    </Route>
    <Route path='c/new' component={CommunityEditor} onEnter={requireLogin()}/>
    <Route path='c/join' component={CommunityJoinForm} onEnter={requireLogin()}/>

    <Route path='n/new' component={NetworkEditor} onEnter={requireLogin()}/>

    <Route path='h/use-invitation' component={InvitationHandler}
      onEnter={requireLogin({
        startAtSignup: true,
        addParams: ({ location: { query: { token } } }) => ({token, action: 'use-invitation'})
      })}/>

    <Route path='c/:id/join/:code' component={CommunityJoinLinkHandler}
      onEnter={requireLogin({
        startAtSignup: true,
        addParams: ({ params: { id } }) => ({id, action: 'join-community'})
      })}/>

    <Route path='c/:id' component={CommunityProfile} onEnter={requireLogin()}>
      <IndexRoute component={CommunityPosts}/>
      <Route path='members' component={CommunityMembers}/>
      <Route path='events' component={CommunityEvents}/>
      <Route path='projects' component={CommunityProjects}/>
      <Route path='about' component={AboutCommunity}/>
      <Route path='settings' component={CommunitySettings}/>
      <Route path='invite' component={CommunityInvitations}/>
    </Route>
    <Route path='p/:id' component={SinglePost}/>
    <Route path='project/new' component={ProjectEditor} onenter={requireLogin()}/>
    <Route path='project/:id/edit' component={ProjectEditor} onenter={requireLogin()}/>
    <Route path='project/:id/:slug' component={ProjectProfile}>
      <IndexRoute component={ProjectPosts}/>
      <Route path='contributors' component={ProjectContributors}/>
    </Route>
    <Route path='project/:id/:slug/invite' component={ProjectInvite}/>
      <Route path='n/:id' component={NetworkProfile} onEnter={requireLogin()}>
        <IndexRoute component={NetworkPosts}/>
        <Route path='communities' component={NetworkCommunities}/>
        <Route path='members' component={NetworkMembers}/>
        <Route path='about' component={NetworkAbout}/>
      </Route>
  </Route>
}

export const projectUrl = project => `/project/${project.id}/${project.slug}`
