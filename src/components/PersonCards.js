import React from 'react'
import A from '../components/A'
import Dropdown from '../components/Dropdown'
import Masonry from 'react-masonry-component'
import { humanDate } from '../util/text'
import { tagUrl } from '../routes'
import { isEmpty } from 'lodash'

const PersonCards = ({ people, menus, slug }) => {
  return <div className='person-cards masonry-container'>
    <Masonry options={{transitionDuration: 0}}>
      {people.map(person => <div key={person.id} className='masonry-item-wrapper'>
        <PersonCard person={person}
          menu={menus && menus[person.id]}
          slug={slug}
          />
      </div>)}
    </Masonry>
  </div>
}

export default PersonCards

export const PersonCard = ({ person, menu, slug }) => {
  let { id, avatar_url, name, bio, isModerator, joined_at, tags, offerCount } = person

  const offersText = Number(offerCount) > 0
  ? `•${offerCount} offer${Number(offerCount) > 1 ? 's' : ''}`
  : null

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
      <div className='role'>
        {(isModerator ? 'Moderator' : 'Member')} since {humanDate(joined_at)}
      </div>
      {bio && <div className='details'>{bio}</div>}
      {offersText && <div className='offerCount'>{offersText}</div>}
      {!isEmpty(tags) && tags.map(tag =>
        <span key={tag.name}>
          <a className='hashtag' href={tagUrl(tag.name, slug)}>
            #{tag.name}
          </a>
          &nbsp;<wbr/>
        </span>)}
    </div>
  </div>
}
