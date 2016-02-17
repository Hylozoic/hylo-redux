import { A } from './A'
import React from 'react'
import cx from 'classnames'
import { VelocityTransitionGroup } from 'velocity-react'

const cutoff = 5

const CommunityListItem = community =>
  <li key={community.id}>
    <A to={`/c/${community.slug}`} title={community.name}>
      <img src={community.avatar_url}/> {community.name}
    </A>
  </li>

const LeftNav = props => {
  let {
    communities,
    open,
    unreadCount,
    toggleCommunities,
    showAllCommunities
  } = props

  let extra = communities.length - cutoff
  if (extra > 0 && showAllCommunities) {
    var moreCommunities = communities.slice(cutoff)
  }
  communities = communities.slice(0, cutoff)

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
      <li className='divider'></li>
      {communities.map(CommunityListItem)}
    </ul>

    <VelocityTransitionGroup enter={{animation: 'slideDown'}} leave={{animation: 'slideUp'}}>
      {moreCommunities && <ul>{moreCommunities.map(CommunityListItem)}</ul>}
    </VelocityTransitionGroup>

    <ul>
      {extra > 0 && <li>
        <a onClick={toggleCommunities} className='meta'>
          {showAllCommunities ? 'Show fewer...' : `Show ${extra} more...`}
        </a>
      </li>}

      <li className='divider'></li>
      <li><A to='/c/join'>Join a community</A></li>
      <li><A to='/c/new'>Create a community</A></li>
    </ul>
  </nav>
}

export default LeftNav
