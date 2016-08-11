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

    return <li className={cx('search', {expanded})} onClick={open}>
      <Icon name='Loupe'/>
      {expanded && <SearchInput onChange={search} ref='input'/>}
      {expanded && <Icon onClick={close} name='Fail'/>}
    </li>
  }
}

const UserMenu = ({ slug, newCount }, { isMobile, dispatch, currentUser }) => {
  const doLogout = () => {
    calliOSBridge({type: 'logout'})
    dispatch(logout())
  }

  return <ul className='right'>
    <SearchMenuItem/>

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
