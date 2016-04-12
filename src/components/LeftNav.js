import { A, IndexA } from './A'
import React from 'react'
import { VelocityTransitionGroup } from 'velocity-react'
import { isEmpty } from 'lodash'

// this value is dupicated in CSS
export const leftNavWidth = 208

export const leftNavEasing = [70, 25]

const animations = {
  enter: {
    animation: {translateX: [0, '-100%']},
    easing: leftNavEasing
  },

  leave: {
    animation: {translateX: '-100%'},
    easing: leftNavEasing
  }
}

export const MenuButton = ({ onClick, label }) =>
  <a className='menu-button' onClick={onClick}>
    <div className='hamburger'>
      <div className='bar'></div>
      <div className='bar'></div>
      <div className='bar'></div>
    </div>
    <span>{label || 'Menu'}</span>
  </a>

export const LeftNav = ({ opened, community, followedTags, close, canModerate, canInvite }) => {
  let { slug } = community || {}

  return <VelocityTransitionGroup {...animations}>
    {opened && <nav id='leftNav'>
      <MenuButton onClick={close}/>
      <ul>
        <li>
          <IndexA to={slug ? `/c/${slug}` : '/'}>
            <Icon name='th-list'/> Conversations
          </IndexA>
        </li>
        {community && <li>
          <A to={`/c/${slug}/events`}>
            <Icon name='calendar'/> Events
          </A>
        </li>}
        <li>
          <A to={slug ? `/c/${slug}/projects` : '/projects'}>
            <Icon name='road'/> Projects
          </A>
        </li>
        {community && <li>
          <A to={`/c/${slug}/members`}>
            <Icon name='user'/> Members
          </A>
        </li>}
        {community && <li>
          <A to={`/c/${slug}/about`}>
            <Icon name='question-sign'/> About
          </A>
        </li>}
        {canInvite && <li>
          <A to={`/c/${slug}/invite`}>
            <Icon name='sunglasses'/> Invite
          </A>
        </li>}
        {canModerate && <li>
          <A to={`/c/${slug}/settings`}>
            <Icon name='cog'/> Settings
          </A>
        </li>}
        {!isEmpty(followedTags) && <li className='subheading'><a>TOPICS</a></li>}
        {!isEmpty(followedTags) && <li>
          <A to={`/c/${slug}/`}>
            • # all-topics
          </A>
        </li>}
        {!isEmpty(followedTags) && followedTags.map(tag => <li key={tag.name}>
          <A to={`/c/${slug}/tag/${tag.name}`}>
            • # {tag.name}
          </A>
        </li>)}
      </ul>
    </nav>}
  </VelocityTransitionGroup>
}

export default LeftNav

const Icon = ({ name }) =>
  <span className={`icon glyphicon glyphicon-${name}`}></span>
