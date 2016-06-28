import React from 'react'
import { A, IndexA } from './A'
import Icon from './Icon'
import { VelocityTransitionGroup } from 'velocity-react'
import { isEmpty, filter } from 'lodash'
import { tagUrl } from '../routes'
import { isMobile } from '../client/util'
import { showAllTags } from '../actions/tags'
import cx from 'classnames'
const { func } = React.PropTypes

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

export const TopicList = ({ tags, slug }, { dispatch }) => {
  let followedTags = filter(tags, t => t.followed && !t.created)
  let createdTags = filter(tags, t => t.created && t.name !== 'chat')

  const TagLink = ({ name, highlight }) => {
    var allTopics = name === 'all-topics'
    var AComponent = allTopics ? IndexA : A
    return <li>
      <AComponent to={tagUrl(name, slug)} className={cx({highlight})}>
        <span className='bullet'>•</span>&nbsp;&nbsp;# {name}
      </AComponent>
    </li>
  }

  return <ul className='topic-list'>
    <li className='subheading'><a>TOPICS ({followedTags.length + 1})</a></li>
    <TagLink name='all-topics'/>
    {!isEmpty(followedTags) && followedTags.map(tag =>
      <TagLink name={tag.name} key={tag.name} highlight={tag.new_post_count}/>)}
    <li>
      <a onClick={() => dispatch(showAllTags(slug))}><Icon name='More'/></a>
    </li>
    {!isEmpty(createdTags) && <li className='subheading'>
      <a>TOPICS CREATED ({createdTags.length})</a>
    </li>}
    {!isEmpty(createdTags) && createdTags.map(tag =>
      <TagLink name={tag.name} key={tag.name} highlight={tag.new_post_count}/>)}
  </ul>
}
TopicList.contextTypes = {dispatch: func}

const CommunityNav = ({ community, canModerate, canInvite }) => {
  const { slug, network } = community || {}
  const url = slug ? suffix => `/c/${slug}/${suffix}` : suffix => '/' + suffix

  return <ul>
    <li>
      <IndexA to={slug ? `/c/${slug}` : '/app'}>
        <Icon name='Comment-Alt'/> Conversations
      </IndexA>
    </li>
    <li>
      <A to={url('events')}><Icon name='Calendar'/> Events</A>
    </li>
    <li>
      <A to={url('projects')}><Icon name='ProjectorScreen'/> Projects</A>
    </li>
    <li>
      <A to={url('people')}><Icon name='Users'/> People</A>
    </li>
    {community && <li>
      <A to={url('about')}><Icon name='Help'/> About</A>
    </li>}
    {canInvite && <li>
      <A to={url('invite')}><Icon name='Mail'/> Invite</A>
    </li>}
    {network && <li>
      <A to={`/n/${network.slug}`}><Icon name='merkaba'/>Network</A>
    </li>}
    {canModerate && <li>
      <A to={url('settings')}><Icon name='Settings'/> Settings</A>
    </li>}
  </ul>
}

const NetworkNav = ({ network }) => {
  const { slug } = network
  const url = suffix => `/n/${slug}/${suffix}`

  return <ul>
    <li>
      <IndexA to={`/n/${slug}`}>
        <Icon name='Comment-Alt'/> Conversations
      </IndexA>
    </li>
    <li>
      <A to={url('communities')}><Icon name='Keypad'/> Communities</A>
    </li>
    <li>
      <A to={url('members')}><Icon name='Users'/> Members</A>
    </li>
    <li>
      <A to={url('about')}><Icon name='Help'/> About</A>
    </li>
  </ul>
}

export const LeftNav = ({ opened, community, network, tags, close, canModerate, canInvite }) => {
  const onMenuClick = event => {
    close()
    event.stopPropagation()
  }

  return <VelocityTransitionGroup {...animations}>
    {opened && <nav id='leftNav' onClick={() => isMobile() && close()}>
      <MenuButton onClick={onMenuClick}/>
      {network
        ? <NetworkNav network={network} />
        : <CommunityNav community={community} canModerate={canModerate}
            canInvite={canInvite}/>}
      {!isEmpty(tags) && <TopicList tags={tags} slug={community.slug}/>}
    </nav>}
    {opened && isMobile() && <div id='leftNavBackdrop' onClick={close}/>}
  </VelocityTransitionGroup>
}

export default LeftNav
