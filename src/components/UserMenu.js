import React from 'react'
import { navigate, logout, markActivityRead } from '../actions'
import { makeUrl } from '../util/navigation'
import { calliOSBridge } from '../client/util'
import Icon from './Icon'
import SearchInput from './SearchInput'
import A from './A'
import Dropdown from './Dropdown'
import { NonLinkAvatar } from './Avatar'
import { isAdmin } from '../models/currentUser'
import { actionText, getActivitiesProps } from '../models/activity'
import cx from 'classnames'
import { connect } from 'react-redux'
import { fetchActivity } from '../actions/activity'
import truncate from 'trunc-html'
import decode from 'ent/decode'
import { postUrl } from '../routes'
import { get } from 'lodash/fp'

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

const NotificationsDropdown = connect(
  (state, props) => getActivitiesProps('all', state)
)(props => {
  const { dispatch, newCount, activities, comments } = props
  return <Dropdown alignRight rivalrous='nav'
    onFirstOpen={() => dispatch(fetchActivity(0, true))}
    toggleChildren={<span>
      <Icon name='Bell'/>
      {newCount > 0 && <div className='badge'>{newCount}</div>}
    </span>}>
    {activities.map(activity => <li key={activity.id}>
      <NotificationsDropdownItem activity={activity}
        comment={comments[activity.comment_id]}/>
    </li>)}
    <li className='bottom'><A to='/notifications'>See all</A></li>
  </Dropdown>
})

const NotificationsDropdownItem = ({ activity, comment }, { dispatch }) => {
  const { id, actor, action, post, unread, meta: { reasons } } = activity
  const postName = truncate(decode(post.name), 140).html
  const markAsRead = () => unread && dispatch(markActivityRead(id))
  return <A to={postUrl(post.id, get('id', comment))} className={cx({unread})}
    onClick={markAsRead}>
    {unread && <div className='dot-badge'/>}
    <NonLinkAvatar person={actor}/>
    <span>
      <strong>{actor.name}</strong>&nbsp;
      {actionText(action, comment, post, reasons)} {postName}
    </span>
  </A>
}
NotificationsDropdownItem.contextTypes = {dispatch: func}

const UserMenu = ({ slug, newCount }, { isMobile, dispatch, currentUser }) => {
  const doLogout = () => {
    calliOSBridge({type: 'logout'})
    dispatch(logout())
    dispatch(navigate('/login'))
  }

  return <ul className='right'>
    <SearchMenuItem/>

    <li id='notifications-menu'>
      <NotificationsDropdown newCount={newCount}/>
    </li>

    <li>
      <Dropdown className='user-menu' alignRight triangle={isMobile}
        rivalrous='nav' backdrop={isMobile} toggleChildren={
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
          <A to='/notifications'>
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
