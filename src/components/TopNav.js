import React from 'react'
import { A } from './A'
import Dropdown from './Dropdown'
import { isAdmin } from '../models/currentUser'
import { get, map } from 'lodash'
import { MenuButton } from './LeftNav'
import { VelocityTransitionGroup } from 'velocity-react'

const communityItem = community =>
  <A to={`/c/${community.slug}`} title={community.name}>
    <img src={community.avatar_url}/> {community.name}
  </A>

const CommunityListItem = community =>
  <li key={community.id}>{communityItem(community)}</li>

const getLabel = path => {
  if (path.endsWith('events')) return 'Events'
  if (path.endsWith('projects')) return 'Projects'
  if (path.endsWith('members')) return 'Members'
  if (path.endsWith('about')) return 'About'
  if (path.endsWith('invite')) return 'Invite'
  if (path.match(/^\/c\/[^\/]+$/)) return 'Conversations'
  return 'Menu'
}

const TopNav = (props) => {
  let { currentUser, logout, openLeftNav, leftNavOpened, path } = props

  let communities = map(get(currentUser, 'memberships'), 'community')
  let currentCommunity = communities[0] // TODO
  let label = getLabel(path)

  return <nav id='topNav' className='clearfix'>
    <VelocityTransitionGroup enter={{animation: 'fadeIn'}}>
      {leftNavOpened || <MenuButton onClick={openLeftNav} label={label}/>}
    </VelocityTransitionGroup>
    <Dropdown className='communities'
      toggleChildren={<div>
        <img src={currentCommunity.avatar_url}/>
        {currentCommunity.name} <span className='caret'></span>
      </div>}>
      {communities.map(CommunityListItem)}
      <li><A to='/c/join'>Join a community</A></li>
      <li><A to='/c/new'>Create a community</A></li>
    </Dropdown>
    {currentUser
    ? <ul className='right'>
        <li>
          <Dropdown alignRight={true} toggleChildren={
            <span>
              {currentUser.name} <span className='caret'></span>
            </span>
          }>
            <li><A to={`/u/${currentUser.id}`}>My profile</A></li>
            <li><A to={'/settings'}>Settings</A></li>
            {isAdmin(currentUser) && <li><A to={'/admin'}>Admin</A></li>}
            <li><a href='#' onClick={logout}>Log out</a></li>
          </Dropdown>
        </li>
      </ul>
    : <ul className='right'>
        <li><A to='/signup'>Sign up</A></li>
        <li><A to='/login'>Log in</A></li>
      </ul>}
  </nav>
}

export default TopNav
