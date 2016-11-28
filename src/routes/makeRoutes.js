import React from 'react'
import { Route, IndexRoute } from 'react-router'
import Signup from '../containers/Signup'
import Login from '../containers/Login'
import SetPassword from '../containers/SetPassword'
import App from '../containers/App'
import AllCommunities, { AllPosts } from '../containers/AllCommunities'
import People from '../containers/People'
import Projects from '../containers/Projects'
import { CreateCommunity, CreateCommunityInvite } from '../containers/CreateCommunity'
import CommunityProfile from '../containers/community/CommunityProfile'
import CommunityPosts from '../containers/community/CommunityPosts'
import CommunityJoinLinkHandler from '../containers/community/CommunityJoinLinkHandler'
import InvitationHandler from '../containers/community/InvitationHandler'
import AboutCommunity from '../containers/community/AboutCommunity'
import CommunitySettings from '../containers/community/CommunitySettings'
import CommunityInvite from '../containers/community/CommunityInvite'
import TagSettings from '../containers/TagSettings'
import TagPosts from '../containers/tag/TagPosts'
import BioPrompt from '../containers/onboarding/BioPrompt'
import TopicsPrompt from '../containers/onboarding/TopicsPrompt'
import SkillsPrompt from '../containers/onboarding/SkillsPrompt'
import WelcomePage from '../containers/onboarding/WelcomePage'
import PersonProfile from '../containers/person/PersonProfile'
import UserSettings from '../containers/user/UserSettings'
import SinglePost from '../containers/SinglePost'
import NetworkProfile from '../containers/network/NetworkProfile'
import NetworkPosts from '../containers/network/NetworkPosts'
import NetworkMembers from '../containers/network/NetworkMembers'
import AboutNetwork from '../containers/network/AboutNetwork'
import IconTest from '../containers/IconTest'
import ThreadPage from '../containers/ThreadPage'
import NetworkCommunities from '../containers/network/NetworkCommunities'
import NetworkEditor from '../containers/network/NetworkEditor'
import Search from '../containers/Search'
import Events from '../containers/Events'
import StandalonePostEditor from '../containers/StandalonePostEditor'
import Admin from '../containers/Admin'
import PageWithNav from '../containers/PageWithNav'
import TestBench from '../containers/TestBench'
import { debug } from '../util/logging'
import { makeUrl } from '../util/navigation'
import { get, pick } from 'lodash'
import { isLoggedIn } from '../models/currentUser'

export default function makeRoutes (store) {
  const requireLoginWithOptions = (options = {}) => (nextState, replace) => {
    let { startAtSignup, addParams } = options

    if (isLoggedIn(store.getState())) return true

    const start = startAtSignup ? 'signup' : 'login'
    debug(`redirecting to ${start}`)

    const { location: { pathname, query } } = nextState
    let params = {
      next: pathname,
      ...pick(query, 'ctt', 'cti', 'ctcn'),
      ...(addParams ? addParams(nextState) : null)
    }

    replace(makeUrl(`/${start}`, params))
  }

  const requireLogin = requireLoginWithOptions()

  const requireAdmin = (nextState, replace) => {
    const currentUser = store.getState().people.current
    if (!get(currentUser, 'is_admin')) {
      replace('/noo/admin/login')
    }
  }

  return <Route component={App}>
    <Route path='/' onEnter={(_, replace) => replace('/app')}/>
    <Route path='signup' component={Signup}/>
    <Route path='login' component={Login}/>

    <Route path='create' component={CreateCommunity} onEnter={requireLogin}/>
    <Route path='invite' component={CreateCommunityInvite} onEnter={requireLogin}/>

    <Route path='set-password' component={SetPassword}/>

    <Route path='add-skills' component={SkillsPrompt} onEnter={requireLogin}/>
    <Route path='add-bio' component={BioPrompt} onEnter={requireLogin}/>
    <Route path='choose-topics' component={TopicsPrompt} onEnter={requireLogin}/>

    <Route path='c/:id/new' component={StandalonePostEditor} community onEnter={requireLogin}/>
    <Route path='c/:id/events/new' component={StandalonePostEditor} community type='event' onEnter={requireLogin}/>
    <Route path='c/:id/projects/new' component={StandalonePostEditor} community type='project' onEnter={requireLogin}/>
    <Route path='p/new' component={StandalonePostEditor} onEnter={requireLogin}/>
    <Route path='p/:id/edit' component={StandalonePostEditor} onEnter={requireLogin}/>

    <Route path='h/use-invitation' component={InvitationHandler}
      onEnter={requireLoginWithOptions({
        startAtSignup: true,
        addParams: ({ location: { query: { token, email } } }) => ({token, email, action: 'use-invitation'})
      })}/>

    <Route component={PageWithNav}>
      <Route path='settings' component={UserSettings} onEnter={requireLogin}/>
      <Route path='search' component={Search} onEnter={requireLogin}/>
      <Route path='u/:id' component={PersonProfile} onEnter={requireLogin}/>

      <Route path='admin' component={Admin} onEnter={requireAdmin}/>

      <Route path='c/:id/join/:code' component={CommunityJoinLinkHandler}
        onEnter={requireLoginWithOptions({
          startAtSignup: true,
          addParams: ({ params: { id } }) => ({id, action: 'join-community'})
        })}/>

      <Route path='c/:id/join/:code/tag/:tagName' component={CommunityJoinLinkHandler}
        onEnter={requireLoginWithOptions({
          startAtSignup: true,
          addParams: ({ params: { id } }) => ({id, action: 'join-community-tag'})
        })}/>

      <Route path='c/:id/onboarding' component={WelcomePage} onEnter={requireLogin}/>
      <Route path='c/:id' component={CommunityProfile}>
        <IndexRoute component={CommunityPosts}/>
        <Route path='people' component={People} onEnter={requireLogin}/>
        <Route path='events' component={Events}/>
        <Route path='projects' component={Projects}/>
        <Route path='about' component={AboutCommunity}/>
        <Route path='settings/tags' component={TagSettings}/>
        <Route path='settings' component={CommunitySettings} onEnter={requireLogin}/>
        <Route path='tag/:tagName' component={TagPosts} onEnter={requireLogin} />
        <Route path='invite' component={CommunityInvite} onEnter={requireLogin}/>
      </Route>

      <Route path='t/:id' component={ThreadPage} onEnter={requireLogin}/>

      <Route path='p/:id' component={SinglePost}/>
      <Route path='n/new' component={NetworkEditor} onEnter={requireLogin}/>
      <Route path='n/:id' component={NetworkProfile} onEnter={requireLogin}>
        <IndexRoute component={NetworkPosts}/>
        <Route path='communities' component={NetworkCommunities}/>
        <Route path='members' component={NetworkMembers}/>
        <Route path='about' component={AboutNetwork}/>
      </Route>
      <Route path='n/:id/edit' component={NetworkEditor} onEnter={requireLogin}/>

      <Route component={AllCommunities}>
        <Route path='app' component={AllPosts}/>
        <Route path='tag/:tagName' component={TagPosts}/>
        <Route path='projects' component={Projects} onEnter={requireLogin}/>
        <Route path='events' component={Events} onEnter={requireLogin}/>
        <Route path='people' component={People} onEnter={requireLogin}/>
      </Route>

      <Route path='testbench' component={TestBench}/>
      <Route path='icons' component={IconTest}/>
    </Route>

    {/* legacy route name, for old versions of the mobile app */}
    <Route path='h/forgot-password' component={SetPassword}/>
  </Route>
}
