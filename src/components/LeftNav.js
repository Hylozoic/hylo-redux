import React from 'react'
import { A, IndexA } from './A'
import Icon from './Icon'
import { VelocityTransitionGroup } from 'velocity-react'
import { isEmpty, filter } from 'lodash'
import { tagUrl } from '../routes'
import { isMobile } from '../client/util'

export const leftNavWidth = 208 // this value is dupicated in CSS
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

export const TopicList = ({ tags, slug }) => {
  let followedTags = filter(tags, t => t.followed && !t.created)
  let createdTags = filter(tags, t => t.created && t.name !== 'chat')

  const TagLink = ({ name }) => {
    var allTopics = name === 'all-topics'
    var AComponent = allTopics ? IndexA : A
    return <li>
      <AComponent to={tagUrl(name, slug)}>
        <span className='bullet'>•</span>&nbsp;&nbsp;# {name}
      </AComponent>
    </li>
  }

  return <ul className='topic-list'>
    <li className='subheading'><a>TOPICS ({followedTags.length + 1})</a></li>
    <TagLink name='all-topics'/>
    {!isEmpty(followedTags) && followedTags.map(tag => <TagLink name={tag.name} key={tag.name} />)}
    {!isEmpty(createdTags) && <li className='subheading'><a>TOPICS CREATED ({createdTags.length})</a></li>}
    {!isEmpty(createdTags) && createdTags.map(tag => <TagLink name={tag.name} key={tag.name} />)}
  </ul>
}

export const LeftNav = ({ opened, community, tags, close, canModerate, canInvite }) => {
  const { slug } = community || {}
  const onMenuClick = event => {
    close()
    event.stopPropagation()
  }

  return <VelocityTransitionGroup {...animations}>
    {opened && <nav id='leftNav' onClick={() => isMobile() && close()}>
      <MenuButton onClick={onMenuClick}/>
      <ul>
        <li>
          <IndexA to={slug ? `/c/${slug}` : '/'}>
            <Icon name='Comment-Alt'/> Conversations
          </IndexA>
        </li>
        <li>
          <A to={slug ? `/c/${slug}/events` : '/events'}>
            <Icon name='Calendar'/> Events
          </A>
        </li>
        <li>
          <A to={slug ? `/c/${slug}/projects` : '/projects'}>
            <Icon name='road' glyphicon={true}/> Projects
          </A>
        </li>
        {community && <li>
          <A to={`/c/${slug}/members`}>
            <Icon name='Users'/> Members
          </A>
        </li>}
        {community && <li>
          <A to={`/c/${slug}/about`}>
            <Icon name='question-sign' glyphicon={true}/> About
          </A>
        </li>}
        {canInvite && <li>
          <A to={`/c/${slug}/invite`}>
            <Icon name='Mail'/> Invite
          </A>
        </li>}
        {canModerate && <li>
          <A to={`/c/${slug}/settings`}>
            <Icon name='cog' glyphicon={true}/> Settings
          </A>
        </li>}
        </ul>
      {!isEmpty(tags) && <TopicList tags={tags} slug={slug} />}
    </nav>}
  </VelocityTransitionGroup>
}

export default LeftNav
