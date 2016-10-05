import React from 'react'
import { A, IndexA } from './A'
import Icon from './Icon'
import Dropdown from './Dropdown'
import { filter, get } from 'lodash/fp'
import { throttle, times } from 'lodash'
import { MenuButton, leftNavWidth, leftNavEasing, menuButtonWidth } from './LeftNav'
import { editorUrl } from '../containers/StandalonePostEditor'
const { array, object, func, string, bool, number } = React.PropTypes
import { viewportTop } from '../util/scrolling'
import { VelocityComponent } from 'velocity-react'
import cx from 'classnames'
import CommunityMenu, { allCommunities } from './CommunityMenu'
import UserMenu from './UserMenu'

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

export default class TopNav extends React.Component {
  static propTypes = {
    refresh: func,
    path: string,
    openLeftNav: func,
    opened: bool,
    community: object,
    network: object,
    leftNavIsOpen: bool,
    links: array,
    notificationCount: number
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
      openLeftNav, leftNavIsOpen, path, network, links, notificationCount
    } = this.props
    const { currentUser, isMobile } = this.context
    const label = getLabel(path)
    const community = this.props.community || allCommunities()
    const { slug } = community
    const newNotificationCount = get('new_notification_count', currentUser)

    const moveWithMenu = isMobile
      ? {marginLeft: leftNavIsOpen ? leftNavWidth : 0}
      : {marginLeft: 0}

    const widenMenuButton = {width: leftNavIsOpen ? leftNavWidth : menuButtonWidth}

    return <VelocityComponent animation={moveWithMenu} easing={leftNavEasing}>
      <nav id='topNav' className={cx('clearfix', {scrolling: this.state.isScrolling})}>
        {isMobile
          ? <MenuButton onClick={openLeftNav} label={label} notificationCount={notificationCount}/>
          : <VelocityComponent animation={widenMenuButton} easing={leftNavEasing}>
              <MenuButton onClick={openLeftNav} notificationCount={notificationCount}/>
            </VelocityComponent>}
        {currentUser
        ? <UserMenu {...{newNotificationCount, slug}}/>
        : <ul className='right'>
            <li><A to='/signup'>Sign up</A></li>
            <li><A to='/login'>Log in</A></li>
          </ul>}

        <CommunityMenu {...{community, network}}/>
        {currentUser && !network && <TopMainMenu {...{links, leftNavIsOpen}}/>}
        {currentUser &&
          <A to={editorUrl(slug, getPostType(path))} className='compose'>
            <Icon name='Compose'/>
          </A>}
      </nav>
    </VelocityComponent>
  }
}

class TopMainMenu extends React.Component {
  static propTypes = {links: array, leftNavIsOpen: bool}

  constructor (props) {
    super(props)
    this.state = {hiddenCount: 0}
  }

  adjustMenu = (depth = 0) => {
    const rightSide = document.querySelector('#topNav > .right')
    const mainMenu = document.querySelector('#topNav > .main-menu')
    const mainMenuEnd = mainMenu.offsetLeft + mainMenu.offsetWidth
    const space = rightSide.offsetLeft - mainMenuEnd
    const { hiddenCount } = this.state
    if (space < 30) {
      this.setState({hiddenCount: hiddenCount + 1})
      if (depth < 6) this.adjustMenu(depth + 1)
    } else if (space > 100 && hiddenCount > 0) {
      this.setState({hiddenCount: Math.max(0, hiddenCount - 1)})
      if (depth < 7) this.adjustMenu(depth + 1)
    }
  }

  componentDidUpdate (prevProps) {
    const { leftNavIsOpen, links } = this.props
    if (links !== prevProps.links) {
      setTimeout(this.adjustMenu)
    }
    if (leftNavIsOpen !== prevProps.leftNavIsOpen) {
      times(4, n => setTimeout(this.adjustMenu, 150 + 150 * n))
    }
  }

  componentDidMount () {
    this.throttledAdjustMenu = throttle(this.adjustMenu, 100)
    window.addEventListener('resize', this.throttledAdjustMenu)
    this.adjustMenu()
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.throttledAdjustMenu)
  }

  render () {
    const { links } = this.props
    const { hiddenCount } = this.state

    const LinkItem = ({ link, className }) => {
      const { url, label, index } = link
      const AComponent = index ? IndexA : A
      return <AComponent to={url} className={className}>{label}</AComponent>
    }

    const topLinks = filter(l => l.label !== 'Network', links)

    return <div className='main-menu'>
      {topLinks.slice(1, topLinks.length - hiddenCount).map((link, i) =>
        <LinkItem link={link} key={link.label}/>)}
      {hiddenCount > 0 && <Dropdown triangle className='overflow-menu'
        openOnHover toggleChildren={<Icon name='More'/>}>
        {topLinks.slice(-hiddenCount).map((link, i) =>
          <li key={link.label} className={`li-${i}`}>
            <LinkItem link={link}/>
          </li>)}
      </Dropdown>}
    </div>
  }
}
