import React from 'react'
import { A, IndexA } from './A'
import Icon from './Icon'
import Tooltip from './Tooltip'
import { VelocityTransitionGroup } from 'velocity-react'
import { isEmpty } from 'lodash'
import { filter, get } from 'lodash/fp'
import { tagUrl } from '../routes'
import { showAllTags } from '../actions/tags'
import cx from 'classnames'
const { bool, func } = React.PropTypes

export const leftNavEasing = [70, 25]
// these values are duplicated in CSS
export const leftNavWidth = 208
export const menuButtonWidth = 87

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

export const MenuButton = ({ onClick, label, showClose, notificationCount }) =>
  <a className='menu-button' onClick={onClick}>
    {!showClose &&
      (notificationCount && notificationCount > 0
        ? <div className='topic-notification'>{notificationCount}</div>
        : <div className='hamburger'>
            <div className='bar'></div>
            <div className='bar'></div>
            <div className='bar'></div>
          </div>)}
    {label && <span>{label}</span>}
    {showClose && <span className='close'>&times;</span>}
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
      <a>FOLLOWING ({followed.length + 1})</a>
    </li>
    <TagLink name='all-topics'/>
    {!isEmpty(followed) && followed.map(tag =>
      <TagLink name={tag.name} key={tag.name} highlight={tag.new_post_count}/>)}
    {slug && <li>
      <a onClick={() => dispatch(showAllTags(slug))} className='browse-all'>
        Follow more topics...
      </a>
    </li>}
  </ul>
}
TopicList.contextTypes = {dispatch: func}

const CommunityNav = ({ links }) => {
  const LinkItem = ({ link }) => {
    const { url, icon, label, index } = link
    const AComponent = index ? IndexA : A
    return <AComponent to={url}><Icon name={icon}/>{label}</AComponent>
  }

  return <ul className='nav-links community-nav-links'>
    {links.map(link => <LinkItem link={link} key={link.label}/>)}
  </ul>
}

const NetworkNav = ({ network }) => {
  const { slug } = network
  const url = suffix => `/n/${slug}/${suffix}`

  return <ul className='nav-links network-nav-links'>
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

  return <span><VelocityTransitionGroup {...animations}>
    {opened && <nav id='leftNav' onClick={() => isMobile && close()}>
      <MenuButton onClick={onMenuClick} label={isMobile ? 'Menu' : 'Topics'} showClose/>
      {network
        ? <NetworkNav network={network} />
        : <CommunityNav links={links}/>}
      {!isEmpty(tags) && <TopicList tags={tags} slug={get('slug', community)}/>}
    </nav>}
    {opened && <div id='leftNavBackdrop' onClick={close}/>}
  </VelocityTransitionGroup>
  {opened && <Tooltip id='topics'
    index={2}
    position='right'
    title='Topics'>
    <p>The Topics you follow or create will be listed here for easy access and to display notifications on new activity in that Topic.</p>
    <p>Clicking a Topic shows you just the Conversations under that Topic.</p>
  </Tooltip>}
  </span>
}
LeftNav.contextTypes = {isMobile: bool}

export default LeftNav
