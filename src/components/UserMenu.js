import React from 'react'
import { navigate, logout } from '../actions'
import { makeUrl } from '../util/navigation'
import { calliOSBridge } from '../client/util'
import Icon from './Icon'
import SearchInput from './SearchInput'
import A from './A'
import Dropdown from './Dropdown'
import { NonLinkAvatar } from './Avatar'
import { isAdmin } from '../models/currentUser'
const { bool, func, object } = React.PropTypes

const UserMenu = ({ slug, newCount }, { isMobile, dispatch, currentUser }) => {
  const search = text => dispatch(navigate(makeUrl('/search', {q: text})))
  const doLogout = () => {
    calliOSBridge({type: 'logout'})
    dispatch(logout())
  }

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
          <a href='#' onClick={doLogout}>
            <Icon name='Fail'/> Log out
          </a>
        </li>
      </Dropdown>
    </li>
  </ul>
}
UserMenu.contextTypes = {isMobile: bool, dispatch: func, currentUser: object}

export default UserMenu
