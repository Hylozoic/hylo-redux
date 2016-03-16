import { A, IndexA } from './A'
import React from 'react'
import { VelocityTransitionGroup } from 'velocity-react'

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

export const LeftNav = ({ opened, community, close }) => {
  let { slug } = community || {}

  return <VelocityTransitionGroup {...animations}>
    {opened && <nav id='leftNav'>
      <MenuButton onClick={close}/>
      <ul>
        <li>
          <IndexA to={`/c/${slug}`}>
            <Icon name='th-list'/> Conversations
          </IndexA>
        </li>
        <li>
          <A to={`/c/${slug}/events`}>
            <Icon name='calendar'/> Events
          </A>
        </li>
        <li>
          <A to={`/c/${slug}/projects`}>
            <Icon name='road'/> Projects
          </A>
        </li>
        <li>
          <A to={`/c/${slug}/members`}>
            <Icon name='user'/> Members
          </A>
        </li>
        <li>
          <A to={`/c/${slug}/about`}>
            <Icon name='question-sign'/> About
          </A>
        </li>
        <li>
          <A to={`/c/${slug}/invite`}>
            <Icon name='sunglasses'/> Invite
          </A>
        </li>
      </ul>
    </nav>}
  </VelocityTransitionGroup>
}

export default LeftNav

const Icon = ({ name }) =>
  <span className={`icon glyphicon glyphicon-${name}`}></span>
