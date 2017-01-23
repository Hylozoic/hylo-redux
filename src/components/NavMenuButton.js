import React from 'react'

const NavMenuButton = ({ onClick, label, showClose, notificationCount }) =>
  <a className='menu-button' onClick={onClick}>
    {!showClose &&
      (notificationCount && notificationCount > 0
        ? <div className='topic-notification'>{notificationCount}</div>
        : <div className='hamburger'>
            <div className='bar' />
            <div className='bar' />
            <div className='bar' />
          </div>)}
    {label && <span>{label}</span>}
    {showClose && <span className='close'>&times;</span>}
  </a>

export default NavMenuButton
