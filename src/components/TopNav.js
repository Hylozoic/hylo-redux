import React from 'react'
import { A } from './A'
import Dropdown from './Dropdown'
import cx from 'classnames'

const TopNav = (props) => {
  let { currentUser, logout, toggleMenu, mainMenuOpened } = props
  return <nav id='topNav' className='clearfix'>
    <ul className='left'>
      <li>
        <i className='icon-hylo-script'></i>
      </li>
      <li className='mobile-menu-link'>
        <a onClick={toggleMenu} className={cx({active: mainMenuOpened})}>
          Menu <span className='caret'></span>
        </a>
      </li>
    </ul>
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
