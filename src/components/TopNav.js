import React from 'react'
import { IndexLink, Link } from 'react-router'

const TopNav = (props) => {
  let { currentUser, logout } = props
  return <nav id='topNav' className='clearfix'>
    <ul className='left'>
      <li>
        <i className='icon-hylo-script'></i>
      </li>
      <li><IndexLink to='/'>Home</IndexLink></li>
    </ul>
    {currentUser
    ? <ul className='left'>
        <li><Link to={`/u/${currentUser.id}`}>{currentUser.name}</Link></li>
        <li><a href='#' onClick={logout}>Log out</a></li>
      </ul>
    : <ul className='left'>
        <li><Link to='/login'>Log in</Link></li>
      </ul>}
  </nav>
}

export default TopNav
