import React from 'react'
import { A, IndexA } from './A'
import { NonLinkAvatar } from './Avatar'
import Dropdown from './Dropdown'
import { isAdmin } from '../models/currentUser'
import { filter, flow, get, map, sortBy } from 'lodash/fp'
import { same } from '../models'
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

const allCommunities = {
  id: null,
  avatar_url: '/img/all-communities-logo.jpg',
  name: 'All Communities'
}

const TopNav = (props) => {
  let { currentUser, logout, openLeftNav, leftNavOpened, path, community } = props
  if (!community) community = allCommunities

  const lastViewed = m => -Date.parse(m.last_viewed_at || '2001-01-01')
  const communities = [community].concat(flow(
    get('memberships'),
    sortBy(lastViewed),
    map('community'),
    filter(c => !same('id', community, c))
  )(currentUser))

  let label = getLabel(path)

  return <nav id='topNav' className='clearfix'>
    <VelocityTransitionGroup enter={{animation: 'fadeIn'}}>
      {leftNavOpened || <MenuButton onClick={openLeftNav} label={label}/>}
    </VelocityTransitionGroup>
    {currentUser
    ? <ul className='right'>
        <li>
          <div className='search'>
            <span className='glyphicon glyphicon-search'></span>
            <input type='text' placeholder='Search'/>
          </div>
        </li>
        <li>
          <A to='/notifications'>
            <div className='glyphicon glyphicon-bell'></div>
          </A>
        </li>
        <li>
          <Dropdown className='user-menu' alignRight={true} toggleChildren={
            <NonLinkAvatar person={currentUser}/>
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
    <CenterMenu {...{communities, community}}/>
  </nav>
}

export default TopNav

const CenterMenu = ({ communities }) =>
  <Dropdown className='communities'
    toggleChildren={<div>
      <img src={communities[0].avatar_url}/>
      {communities[0].name} <span className='caret'></span>
    </div>}>
    <li>
      <ul className='inner-list dropdown-menu'>
        <li key='all'>
          <IndexA to='/'>
            <img src={allCommunities.avatar_url}/> All Communities
          </IndexA>
        </li>
        {communities.slice(1).map(CommunityListItem)}
      </ul>
    </li>
    <li className='join-or-start'>
      <div>
        <A to='/c/join'>Join</A> or <A to='/c/new'>start</A> a community
      </div>
    </li>
  </Dropdown>
