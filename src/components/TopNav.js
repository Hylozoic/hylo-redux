import React from 'react'
import { A } from './A'
import Icon from './Icon'
import { NonLinkAvatar } from './Avatar'
import Dropdown from './Dropdown'
import { isAdmin } from '../models/currentUser'
import { filter, find, flow, get, map, sortBy } from 'lodash/fp'
import { same } from '../models'
import { MenuButton, leftNavEasing, leftNavWidth } from './LeftNav'
import { VelocityComponent } from 'velocity-react'
import { editorUrl } from '../containers/StandalonePostEditor'
const { func, object } = React.PropTypes

const getPostType = path => {
  if (path.endsWith('events')) return 'event'
  if (path.endsWith('projects')) return 'project'
}

const getLabel = path => {
  if (path.endsWith('events')) return 'Events'
  if (path.endsWith('projects')) return 'Projects'
  if (path.endsWith('members')) return 'Members'
  if (path.endsWith('about')) return 'About'
  if (path.endsWith('invite')) return 'Invite'
  if (path === '/' || path.match(/^\/c\/[^\/]+$/)) return 'Conversations'
  return 'Menu'
}

const allCommunities = {
  id: null,
  avatar_url: '/img/all-communities-logo.jpg',
  name: 'All Communities'
}

const getCommunities = (currentUser, community) =>
  [community].concat(flow(
    get('memberships'),
    sortBy(m => -Date.parse(m.last_viewed_at || '2001-01-01')),
    map('community'),
    filter(c => !same('id', community, c))
  )(currentUser))

const getCurrentMembership = (currentUser, community) =>
  flow(
    get('memberships'),
    find(m => m.community.id === community.id)
  )(currentUser)

const TopNav = (props, { currentUser }) => {
  const {
    search, logout, openLeftNav, path, onChangeCommunity, opened, isMobile
  } = props
  const label = getLabel(path)
  const community = props.community || allCommunities
  const { slug } = community
  const communities = getCommunities(currentUser, community)
  const membership = getCurrentMembership(currentUser, community)
  const newCount = get('new_notification_count',
    community === allCommunities ? currentUser : membership)

  const moveAgainstMenu = isMobile ? null
    : {marginLeft: opened ? -leftNavWidth : 0}

  return <nav id='topNav' className='clearfix'>
    <VelocityComponent animation={moveAgainstMenu} easing={leftNavEasing}>
      <MenuButton onClick={openLeftNav} label={label}/>
    </VelocityComponent>
    {currentUser
    ? <UserMenu {...{logout, currentUser, newCount, slug, isMobile}}/>
    : <ul className='right'>
        <li><A to='/signup'>Sign up</A></li>
        <li><A to='/login'>Log in</A></li>
      </ul>}

    {currentUser && <CommunityMenu {...{communities, onChangeCommunity}}/>}
    {currentUser && isMobile &&
      <A to={editorUrl(slug, getPostType(path))} className='compose'>
        <Icon name='edit'/>
      </A>}

    <div className='search'>
      <Icon name='Loupe'/>
      <Search onChange={search}/>
    </div>
  </nav>
}
TopNav.contextTypes = {currentUser: object}

export default TopNav

class Search extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  static propTypes = {
    onChange: func.isRequired
  }

  render () {
    const handleChange = ({ target: { value } }) => this.setState({value})
    const handleKeyUp = ({ which }) =>
      which === 13 && this.props.onChange(this.state.value)

    return <input type='text' placeholder='Search'
      onKeyUp={handleKeyUp} onChange={handleChange}/>
  }
}

const CommunityMenu = ({ communities, onChangeCommunity }) =>
  <Dropdown className='communities'
    backdrop={true}
    toggleChildren={<div>
      <img src={communities[0].avatar_url}/>
      <span className='name'>
        {communities[0].name} <span className='caret'></span>
      </span>
    </div>}>
    <li>
      <ul className='inner-list dropdown-menu'>
        <li key='all'>
          <a onClick={() => onChangeCommunity()}>
            <img src={allCommunities.avatar_url}/> All Communities
          </a>
        </li>
        {communities.slice(1).map(community => <li key={community.id}>
          <a onClick={() => onChangeCommunity(community)} title={community.name}>
            <img src={community.avatar_url}/> {community.name}
          </a>
        </li>)}
      </ul>
    </li>
    <li className='join-or-start'>
      <div>
        <A to='/c/join'>Join</A> or <A to='/c/new'>start</A> a community
      </div>
    </li>
  </Dropdown>

const UserMenu = ({ isMobile, slug, logout, newCount, currentUser }) => {
  return <ul className='right'>
    {!isMobile && <li className='notifications'>
      <A to={`${slug ? '/c/' + slug : ''}/notifications`}>
        <Icon name='bell'/>
        {newCount > 0 && <div className='badge'>{newCount}</div>}
      </A>
    </li>}
    <li>
      <Dropdown className='user-menu' alignRight={true} toggleChildren={
        <div>
          <NonLinkAvatar person={currentUser}/>
          {isMobile && newCount > 0 && <div className='dot-badge'/>}
        </div>
      }>
        <li><A to={`/u/${currentUser.id}`}>My profile</A></li>
        {isMobile && <li>
          <A to={slug ? `/c/${slug}/notifications` : '/notifications'}>
            Notifications
            {newCount > 0 && <span className='badge'>{newCount}</span>}
          </A>
        </li>}
        <li><A to={'/settings'}>Settings</A></li>
        {isAdmin(currentUser) && <li><A to={'/admin'}>Admin</A></li>}
        <li><a href='#' onClick={logout}>Log out</a></li>
      </Dropdown>
    </li>
  </ul>
}
