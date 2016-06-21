import React from 'react'
import { Route, IndexRoute } from 'react-router'
import Signup from './containers/Signup'
import Login from './containers/Login'
import SetPassword from './containers/SetPassword'
import App from './containers/App'
import { AllPosts, MyPosts, FollowedPosts } from './containers/home'
import AllCommunities from './containers/AllCommunities'
import People from './containers/People'
import Projects from './containers/Projects'
import CommunityProfile from './containers/community/CommunityProfile'
import CommunityPosts from './containers/community/CommunityPosts'
import CommunityEditor from './containers/community/CommunityEditor'
import CommunityInvitations from './containers/community/CommunityInvitations'
import CommunityJoinForm from './containers/community/CommunityJoinForm'
import CommunityJoinLinkHandler from './containers/community/CommunityJoinLinkHandler'
import InvitationHandler from './containers/community/InvitationHandler'
import AboutCommunity from './containers/community/AboutCommunity'
import CommunitySettings from './containers/community/CommunitySettings'
import TagSettings from './containers/TagSettings'
import TagPosts from './containers/tag/TagPosts'
import Onboarding from './containers/Onboarding'
import PersonProfile from './containers/person/PersonProfile'
import UserSettings from './containers/user/UserSettings'
import SinglePost from './containers/SinglePost'
import NetworkProfile from './containers/network/NetworkProfile'
import NetworkPosts from './containers/network/NetworkPosts'
import NetworkMembers from './containers/network/NetworkMembers'
import AboutNetwork from './containers/network/AboutNetwork'
import IconTest from './containers/IconTest'
import NetworkCommunities from './containers/network/NetworkCommunities'
import NetworkEditor from './containers/network/NetworkEditor'
import Notifications from './containers/Notifications'
import Search from './containers/Search'
import Events from './containers/Events'
import StandalonePostEditor from './containers/StandalonePostEditor'
import Admin from './containers/Admin'
import TestBench from './containers/TestBench'
import { debug } from './util/logging'
import { makeUrl } from './util/navigation'
import { get, isEmpty } from 'lodash'

export default function makeRoutes (store) {
  const requireLoginWithOptions = (options = {}) => (nextState, replaceState) => {
    let { startAtSignup, addParams } = options
    if (store.getState().people.current) return true

    let start = startAtSignup ? 'signup' : 'login'
    debug(`redirecting to ${start}`)

    let params = {
      next: nextState.location.pathname,
      ...(addParams ? addParams(nextState) : null)
    }

    replaceState({}, makeUrl(`/${start}`, params))
  }

  const requireLogin = requireLoginWithOptions()

  const requireAdmin = (nextState, replaceState) => {
    const currentUser = store.getState().people.current
    if (!get(currentUser, 'is_admin')) {
      replaceState({}, '/noo/admin/login')
    }
  }

  const requireCommunity = (options = {}) => (nextState, replaceState) => {
    if (!requireLoginWithOptions(options)(nextState, replaceState)) return

    if (isEmpty(get(store.getState().people.current, 'memberships'))) {
      replaceState({}, '/c/join')
    }
  }

  return <Route path='/' component={App}>
    <IndexRoute component={AllPosts} onEnter={requireCommunity()}/>
    // /app route is for compatibility with iOS v1.6 and Android v1.0.10
    <Route path='app' component={AllPosts} onEnter={requireCommunity()}/>
    <Route path='signup' component={Signup}/>
    <Route path='login' component={Login}/>
    <Route path='set-password' component={SetPassword}/>
    <Route path='settings' component={UserSettings} onEnter={requireLogin}/>
    <Route path='my-posts' component={MyPosts} onEnter={requireLogin}/>
    <Route path='followed-posts' component={FollowedPosts} onEnter={requireLogin}/>
    <Route path='search' component={Search} onEnter={requireLogin}/>
    <Route path='u/:id' component={PersonProfile} onEnter={requireLogin}/>
    <Route path='c/new' component={CommunityEditor} onEnter={requireLogin}/>
    <Route path='c/join' component={CommunityJoinForm} onEnter={requireLogin}/>

    <Route path='admin' component={Admin} onEnter={requireAdmin}/>

    <Route path='h/use-invitation' component={InvitationHandler}
      onEnter={requireLoginWithOptions({
        startAtSignup: true,
        addParams: ({ location: { query: { token } } }) => ({token, action: 'use-invitation'})
      })}/>

    <Route path='c/:id/join/:code' component={CommunityJoinLinkHandler}
      onEnter={requireLoginWithOptions({
        startAtSignup: true,
        addParams: ({ params: { id } }) => ({id, action: 'join-community'})
      })}/>

    <Route path='c/:id/onboarding' component={Onboarding} onEnter={requireLogin}/>
    <Route path='c/:id/new' component={StandalonePostEditor} community onEnter={requireLogin}/>
    <Route path='c/:id/events/new' component={StandalonePostEditor} community type='event' onEnter={requireLogin}/>
    <Route path='c/:id/projects/new' component={StandalonePostEditor} community type='project' onEnter={requireLogin}/>
    <Route path='c/:id' component={CommunityProfile}>
      <IndexRoute component={CommunityPosts}/>
      <Route path='people' component={People} onEnter={requireLogin}/>
      <Route path='events' component={Events}/>
      <Route path='projects' component={Projects}/>
      <Route path='about' component={AboutCommunity}/>
      <Route path='settings/tags' component={TagSettings}/>
      <Route path='settings' component={CommunitySettings} onEnter={requireLogin}/>
      <Route path='invite' component={CommunityInvitations} onEnter={requireLogin}/>
      <Route path='tag/:tagName' component={TagPosts} onEnter={requireLogin} />
      <Route path='notifications' component={Notifications} onEnter={requireLogin}/>
    </Route>

    <Route path='p/new' component={StandalonePostEditor} onEnter={requireLogin}/>
    <Route path='p/:id' component={SinglePost}/>
    <Route path='p/:id/edit' component={StandalonePostEditor} onEnter={requireLogin}/>
    <Route path='n/new' component={NetworkEditor} onEnter={requireLogin}/>
    <Route path='n/:id' component={NetworkProfile} onEnter={requireLogin}>
      <IndexRoute component={NetworkPosts}/>
      <Route path='communities' component={NetworkCommunities}/>
      <Route path='members' component={NetworkMembers}/>
      <Route path='about' component={AboutNetwork}/>
    </Route>
    <Route path='n/:id/edit' component={NetworkEditor} onEnter={requireLogin}/>

    <Route component={AllCommunities}>
      <Route path='tag/:tagName' component={TagPosts}/>
      <Route path='notifications' component={Notifications} onEnter={requireLogin}/>
      <Route path='projects' component={Projects} onEnter={requireLogin}/>
      <Route path='events' component={Events} onEnter={requireLogin}/>
      <Route path='people' component={People} onEnter={requireLogin}/>
    </Route>

    <Route path='testbench' component={TestBench}/>
    <Route path='icons' component={IconTest}/>
  </Route>
}

export const communityUrl = (community, params) =>
  makeUrl(`/c/${community.slug}`, params)

export const communityOnboardingUrl = community =>
  `/c/${community.slug}/onboarding`

export const commentUrl = comment =>
  `/p/${comment.post_id}#comment-${comment.id}`

export const postUrl = (postId, commentId) =>
  `/p/${postId}` + (commentId ? `#comment-${commentId}` : '')

export const tagUrl = (name, slug) => {
  var result = ''
  if (slug) result += `/c/${slug}`
  if (name !== 'all-topics') result += `/tag/${name}`
  return result
}

export const tagUrlComponents = (url) => {
  let match = url.match(/\/c\/([^\/]+)\/tag\/([^\/]+)/)
  if (!match) return {}
  return {
    slug: match[1],
    tagName: match[2]
  }
}

export const isSearchUrl = (path) =>
  path.split('?')[0] === '/search'

export const peopleUrl = community =>
  `${community ? '/c/' + community.slug : ''}/people`
