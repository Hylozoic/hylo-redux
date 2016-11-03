import React from 'react'
import { navigate, logout, showModal, resetTooltips } from '../actions'
import { makeUrl } from '../util/navigation'
import { calliOSBridge } from '../client/util'
import Icon from './Icon'
import SearchInput from './SearchInput'
import { ThreadsDropdown } from '../containers/ThreadsDropdown'
import { NotificationsDropdown } from '../containers/Notifications'
import A from './A'
import Dropdown from './Dropdown'
import { NonLinkAvatar } from './Avatar'
import { isAdmin, hasFeature } from '../models/currentUser'
import { DIRECT_MESSAGES } from '../config/featureFlags'
import cx from 'classnames'

const { bool, func, object } = React.PropTypes

class SearchMenuItem extends React.Component {
  static contextTypes = {dispatch: func}

  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    const { dispatch } = this.context
    const { expanded } = this.state
    const search = text => {
      dispatch(navigate(makeUrl('/search', {q: text})))
      close()
      this.refs.input.clear()
    }
    const open = () => {
      this.setState({expanded: true})
      setTimeout(() => this.refs.input.focus())
    }
    const close = event => {
      this.setState({expanded: false})
      if (event) event.stopPropagation()
    }

    return <li className='search-container'>
      <div className={cx('search', {expanded})} onClick={open}>
        <div className='search-border'>
          <Icon name='Loupe'/>
          {expanded && <SearchInput onChange={search} ref='input'/>}
          {expanded && <Icon onClick={close} name='Fail'/>}
        </div>
      </div>
    </li>
  }
}

const UserMenu = ({ slug, newMessageCount, newNotificationCount }, { isMobile, dispatch, currentUser }) => {
  const { settings: { last_viewed_messages_at }, id } = currentUser
  const doLogout = () => {
    calliOSBridge({type: 'logout'})
    dispatch(navigate('/login'))
    dispatch(logout())
    return false
  }

  const showDotBadge = newNotificationCount > 0 || newMessageCount > 0

  return <ul className='right'>
    <SearchMenuItem/>

    {hasFeature(currentUser, DIRECT_MESSAGES) &&
      <li className='nav-notify-dropdown'>
        <ThreadsDropdown lastViewed={last_viewed_messages_at} newCount={newMessageCount}/>
      </li>}

    <li className='nav-notify-dropdown'>
      <NotificationsDropdown newCount={newNotificationCount}/>
    </li>

    <li>
      <Dropdown className='user-menu' alignRight triangle={isMobile}
        rivalrous='nav' backdrop={isMobile} toggleChildren={
          <div>
            <NonLinkAvatar person={currentUser}/>
            {showDotBadge && <div className='dot-badge'/>}
          </div>
        }>
        <li>
          <A to={`/u/${currentUser.id}`}>
            <Icon name='User'/> My profile
          </A>
        </li>
        <li className='dropdown-notifications'>
          <a onClick={() => dispatch(showModal('notifications'))}>
            <Icon name='Bell'/> Notifications
            {newNotificationCount > 0 && <span className='badge'>{newNotificationCount}</span>}
          </a>
        </li>
        {hasFeature(currentUser, DIRECT_MESSAGES) &&
          <li className='dropdown-threads'>
            <a onClick={() => dispatch(showModal('threads'))}>
              <Icon name='Message-Smile'/> Messages
              {newMessageCount > 0 && <span className='badge'>{newMessageCount}</span>}
            </a>
          </li>}
        <li>
          <A to={'/settings'}>
            <Icon name='Settings'/> Settings
          </A>
        </li>
        <li>
          <a onClick={() => dispatch(resetTooltips(id))}>
            <Icon name='ProjectorScreen'/> Start tour
          </a>
        </li>
        {isAdmin(currentUser) && <li>
          <A to={'/admin'}>
            <Icon name='Keypad'/> Admin
          </A>
        </li>}
        <li>
          <a onClick={doLogout}>
            <Icon name='Fail'/> Log out
          </a>
        </li>
      </Dropdown>
    </li>
  </ul>
}
UserMenu.contextTypes = {isMobile: bool, dispatch: func, currentUser: object}

export default UserMenu
