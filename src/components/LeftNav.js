import React from 'react'
import { A, IndexA } from './A'
import Icon from './Icon'
import { VelocityTransitionGroup } from 'velocity-react'
import { isEmpty } from 'lodash'
import { filter } from 'lodash/fp'
import { tagUrl } from '../routes'
import { showAllTags } from '../actions/tags'
import cx from 'classnames'
const { bool, func } = React.PropTypes

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
  const followed = filter('followed', tags)
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
    <li className='subheading'>
      <a>TOPICS YOU FOLLOW ({followed.length + 1})</a>
    </li>
    <TagLink name='all-topics'/>
    {!isEmpty(followed) && followed.map(tag =>
      <TagLink name={tag.name} key={tag.name} highlight={tag.new_post_count}/>)}
    <li>
      <a onClick={() => dispatch(showAllTags(slug))} className='browse-all'>
        Browse all topics...
      </a>
    </li>
  </ul>
}
TopicList.contextTypes = {dispatch: func}

const CommunityNav = ({ links }) => {
  const LinkItem = ({ link }) => {
    const { url, icon, label, index } = link
    const AComponent = index ? IndexA : A
    return <AComponent to={url}><Icon name={icon}/>{label}</AComponent>
  }

  return <ul className='nav-links'>
    {links.map(link => <LinkItem link={link} key={link.label}/>)}
  </ul>
}

const NetworkNav = ({ network }) => {
  const { slug } = network
  const url = suffix => `/n/${slug}/${suffix}`

  return <ul className='nav-links'>
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

export const LeftNav = ({ opened, community, network, tags, close, links }, { isMobile }) => {
  const onMenuClick = event => {
    close()
    event.stopPropagation()
  }

  return <VelocityTransitionGroup {...animations}>
    {opened && <nav id='leftNav' onClick={() => isMobile && close()}>
      <MenuButton onClick={onMenuClick}/>
      {network
        ? <NetworkNav network={network} />
        : isMobile && <CommunityNav links={links}/>}
      {!isEmpty(tags) && <TopicList tags={tags} slug={community.slug}/>}
    </nav>}
    {opened && isMobile && <div id='leftNavBackdrop' onClick={close}/>}
  </VelocityTransitionGroup>
}
LeftNav.contextTypes = {isMobile: bool}

export default LeftNav
