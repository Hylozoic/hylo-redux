import { A } from './A'
import React from 'react'
import cx from 'classnames'

const LeftNav = ({ communities, open, unreadCount }) => {
  return <nav id='leftNav' className={cx({open})}>
    <ul>
      <li><A to='/all-posts'>All posts</A></li>
      <li><A to='/my-posts'>My posts</A></li>
      <li><A to='/followed-posts'>Followed posts</A></li>
      <li><A to='/projects'>Projects</A></li>
      <li>
        <A to='/notifications'>
          Notifications
          {unreadCount > 0 ? ` (${unreadCount})` : ''}
        </A>
      </li>
      {communities.map((c, i) => <li key={i}>
        <A to={`/c/${c.slug}`}>
          <img src={c.avatar_url}/>
          {c.name}
        </A>
      </li>)}
      <li><A to='/c/new'>Create a community</A></li>
      <li><A to='/c/join'>Join a community</A></li>
    </ul>
  </nav>
}

export default LeftNav
