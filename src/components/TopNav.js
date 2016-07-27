import React from 'react'
import { A, IndexA } from './A'
import Icon from './Icon'
import { NonLinkAvatar } from './Avatar'
import Dropdown from './Dropdown'
import SearchInput from './SearchInput'
import { isAdmin } from '../models/currentUser'
import { filter, find, flow, get, map, sortBy } from 'lodash/fp'
import { throttle, merge } from 'lodash'
import { same } from '../models'
import { nextPath } from '../util/navigation'
import { MenuButton, leftNavWidth, leftNavEasing, menuButtonWidth } from './LeftNav'
import { editorUrl } from '../containers/StandalonePostEditor'
import { assetUrl } from '../util/assets'
const { array, object, func, string, bool } = React.PropTypes
import { viewportTop } from '../util/scrolling'
import { VelocityComponent } from 'velocity-react'
import cx from 'classnames'
import { navigate } from '../actions'
import { communityUrl, networkUrl } from '../routes'

const getPostType = path => {
  if (path.endsWith('events')) return 'event'
  if (path.endsWith('projects')) return 'project'
}

const getLabel = path => {
  if (path.endsWith('events')) return 'Events'
  if (path.endsWith('projects')) return 'Projects'
  if (path.endsWith('people')) return 'Members'
  if (path.endsWith('about')) return 'About'
  if (path.endsWith('invite')) return 'Invite'
  if (path === '/app' || path.match(/^\/c\/[^\/]+$/)) return 'Conversations'
  return 'Menu'
}

const allCommunities = () => ({
  id: null,
  avatar_url: assetUrl('/img/hylo-merkaba-300x300.png'),
  name: 'All Communities'
})

const getMenuItems = (currentUser, firstItem) =>
  [firstItem].concat(flow(
    get('memberships'),
    sortBy(m => -Date.parse(m.last_viewed_at || '2001-01-01')),
    map('community'),
    firstItem.isNetwork ? i => i : filter(c => !same('id', firstItem, c))
  )(currentUser))

const getCurrentMembership = (currentUser, community) =>
  flow(
    get('memberships'),
    find(m => m.community.id === get('id', community))
  )(currentUser)

export default class TopNav extends React.Component {
  static propTypes = {
    refresh: func,
    search: func,
    path: string,
    logout: func,
    openLeftNav: func,
    onChangeCommunity: func,
    opened: bool,
    community: object,
    network: object,
    leftNavIsOpen: bool,
    links: array,
    networkCommunities: array,
    networkNavAnimation: object,
    networkNavEasing: array
  }

  static contextTypes = {
    currentUser: object,
    isMobile: bool
  }

  constructor (props) {
    super(props)
    this.state = {isScrolling: false}
  }

  handleScrollEvents = throttle(event => {
    event.preventDefault()
    if (this.state.isScrolling) {
      if (viewportTop() === 0) {
        this.setState({isScrolling: false})
      }
    } else {
      if (viewportTop() > 0) {
        this.setState({isScrolling: true})
      }
    }
  }, 50)

  componentDidMount () {
    if (!this.context.isMobile) {
      this.setState({isScrolling: viewportTop() > 0})
      window.addEventListener('scroll', this.handleScrollEvents)
    }
  }

  componentWillUnmount () {
    if (!this.context.isMobile) {
      window.removeEventListener('scroll', this.handleScrollEvents)
    }
  }

  render () {
    const {
      search, logout, openLeftNav, leftNavIsOpen, path, onChangeCommunity,
      network, links, networkCommunities, networkNavAnimation, networkNavEasing
    } = this.props
    const { currentUser, isMobile } = this.context
    const label = getLabel(path)
    const community = this.props.community || allCommunities()
    const { slug } = community
    const firstItem = network ? merge(network, {isNetwork: true}) : community
    const menuItems = getMenuItems(currentUser, firstItem)
    const membership = getCurrentMembership(currentUser, community)
    const newCount = get('new_notification_count',
      community.id ? membership : currentUser)

    const moveWithMenu = isMobile
      ? {marginLeft: leftNavIsOpen ? leftNavWidth : 0}
      : {marginLeft: 0}

    const widenMenuButton = {width: leftNavIsOpen ? leftNavWidth : menuButtonWidth}

    return <VelocityComponent animation={moveWithMenu} easing={leftNavEasing}>
      <nav id='topNav' className={cx('clearfix', {scrolling: this.state.isScrolling})}>
        {isMobile
          ? <MenuButton onClick={openLeftNav} label={label}/>
          : <VelocityComponent animation={widenMenuButton} easing={leftNavEasing}>
              <MenuButton onClick={openLeftNav}/>
            </VelocityComponent>}
        {currentUser
        ? <UserMenu {...{logout, currentUser, newCount, slug, search}}/>
        : <ul className='right'>
            <li><A to='/signup'>Sign up</A></li>
            <li><A to='/login'>Log in</A></li>
          </ul>}

        {currentUser && <CommunityMenu {...{menuItems, onChangeCommunity}}/>}
        {currentUser && !network && <TopMainMenu links={links}/>}
        {currentUser &&
          <A to={editorUrl(slug, getPostType(path))} className='compose'>
            <Icon name='Compose'/>
          </A>}
        {currentUser && !isMobile && networkCommunities &&
          networkCommunities.length > 1 &&
          <NetworkCommunityLinks
            communities={networkCommunities}
            network={network || community.network}
            animation={networkNavAnimation}
            easing={networkNavEasing} />}
      </nav>
    </VelocityComponent>
  }
}

const TopMainMenu = ({ community, links }) => {
  const LinkItem = ({ link, className }) => {
    const { url, label, index } = link
    const AComponent = index ? IndexA : A
    return <AComponent to={url} className={className}>{label}</AComponent>
  }

  return <div className='main-menu'>
    {links.slice(0, 3).map(link =>
      <LinkItem className={`a-${link.label}`} link={link} key={link.label}/>)}
    <Dropdown triangle className='overflow-menu' openOnHover
      toggleChildren={<Icon name='More'/>}>
      {links.slice(1).map(link => <li key={link.label} className={`li-${link.label}`}>
        <LinkItem link={link}/>
      </li>)}
    </Dropdown>
  </div>
}

const CommunityMenu = ({ menuItems, onChangeCommunity }, { isMobile, dispatch }) => {
  const currentItem = menuItems[0]
  const { isNetwork, id } = currentItem
  const jumpToConversations = event => {
    if (isMobile) return
    event.preventDefault()
    event.stopPropagation()
    dispatch(navigate(nextPath('', id ? currentItem : null, isNetwork)))
  }

  return <Dropdown className='communities' backdrop triangle toggleChildren={
      <div>
        <img src={currentItem.avatar_url} title='Jump to Conversations'
          onClick={jumpToConversations}/>
        <span className={cx('name', {network: isNetwork})}>
          {currentItem.name}
        </span>
        <span className='caret'></span>
        {isNetwork && <span className='subtitle'>Network</span>}
      </div>
    }>
    <li>
      <ul className='inner-list dropdown-menu'>
        <li key='all'>
          <a onClick={() => onChangeCommunity()}>
            <img src={allCommunities().avatar_url}/> All Communities
          </a>
        </li>
        {menuItems.slice(1).map(community => <li key={community.id}>
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
}
CommunityMenu.contextTypes = {isMobile: bool, dispatch: func}

const UserMenu = ({ slug, logout, newCount, currentUser, search }, { isMobile }) => {
  return <ul className='right'>
    <li className='search'>
      <Icon name='Loupe'/>
      <SearchInput onChange={search}/>
    </li>

    <li className='notifications'>
      <A to={`${slug ? '/c/' + slug : ''}/notifications`}>
        <Icon name='Bell'/>
        {newCount > 0 && <div className='badge'>{newCount}</div>}
      </A>
    </li>

    <li>
      <Dropdown className='user-menu' alignRight openOnHover triangle={isMobile}
        backdrop={isMobile} toggleChildren={
          <div>
            <NonLinkAvatar person={currentUser}/>
            {newCount > 0 && <div className='dot-badge'/>}
          </div>
        }>
        <li>
          <A to={`/u/${currentUser.id}`}>
            <Icon name='User'/> My profile
          </A>
        </li>
        <li className='dropdown-notifications'>
          <A to={slug ? `/c/${slug}/notifications` : '/notifications'}>
            <Icon name='Bell'/> Notifications
            {newCount > 0 && <span className='badge'>{newCount}</span>}
          </A>
        </li>
        <li>
          <A to={'/settings'}>
            <Icon name='Settings'/> Settings
          </A>
        </li>
        {isAdmin(currentUser) && <li>
          <A to={'/admin'}>
            <Icon name='Keypad'/> Admin
          </A>
        </li>}
        <li>
          <a href='#' onClick={logout}>
            <Icon name='Fail'/> Log out
          </a>
        </li>
      </Dropdown>
    </li>
  </ul>
}
UserMenu.contextTypes = {isMobile: bool}

const NetworkCommunityLinks = ({ communities, network, animation, easing }, { isMobile }) => {
  const removeImpactHub = name => name.replace(/^Impact Hub /, '')
  return <VelocityComponent animation={animation} easing={easing}>
    <div className='network-nav'>
      <Dropdown className='all-communities' alignRight
        toggleChildren={<Icon name='More'/>}>
        {sortBy('name', communities).map(community =>
          <li key={community.slug}>
            <A to={communityUrl(community)}>
              {removeImpactHub(community.name)}
            </A>
          </li>)}
      </Dropdown>
      Communities: <A to={networkUrl(network)}>All</A>
      {communities.map(community =>
        <A to={communityUrl(community)} key={community.slug}>
          {removeImpactHub(community.name)}
        </A>)}
    </div>
  </VelocityComponent>
}
