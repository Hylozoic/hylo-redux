import React from 'react'
import A from '../components/A'
import Dropdown from '../components/Dropdown'
import Masonry from 'react-masonry-component'
import { humanDate } from '../util/text'
import { tagUrl } from '../routes'
import { isEmpty } from 'lodash'

const PersonCards = ({ people, menus, subtitles, slug }) => {
  return <div className='person-cards masonry-container'>
    <Masonry options={{transitionDuration: 0}}>
      {people.map(person => <div key={person.id} className='masonry-item-wrapper'>
        <PersonCard person={person}
          menu={menus && menus[person.id]}
          subtitle={subtitles && subtitles[person.id]}
          slug={slug}
          />
      </div>)}
    </Masonry>
  </div>
}

export default PersonCards

export const PersonCard = ({ person, menu, subtitle, slug }) => {
  let { id, avatar_url, name, bio, isModerator, joined_at, createdTags } = person
  var role_and_age = isModerator ? 'Moderator' : 'Member'
  role_and_age += ` since ${humanDate(joined_at)}`

  return <div className='person-card'>
    {menu && <Dropdown className='caret-menu' alignRight={true}
      toggleChildren={<i className='icon-down'></i>}>
      {menu}
    </Dropdown>}
    <A to={`/u/${person.id}`}>
      <img className='square-avatar' src={avatar_url}/>
    </A>
    <div className='person-body'>
      <A className='name' to={`/u/${id}`}>{name}</A>
      <div className='role'>{role_and_age}</div>
      {isModerator && <div className='moderator'>Moderator</div>}
      {subtitle && <div className='subtitle'>{subtitle}</div>}
      {bio && <div className='details'>{bio}</div>}
      {!isEmpty(createdTags) && createdTags.map(tag =>
        <a className='hashtag' href={tagUrl(tag.name, slug)}>#{tag.name}&nbsp;</a>)}
    </div>
  </div>
}
