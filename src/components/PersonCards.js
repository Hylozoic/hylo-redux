import React from 'react'
import A from '../components/A'
import Dropdown from '../components/Dropdown'
import Masonry from 'react-masonry-component'
import { humanDate } from '../util/text'
import { isEmpty } from 'lodash'

const PersonCards = ({ people, slug, onSkillClick, removeMember }) => {
  return <div className='person-cards masonry-container'>
    <Masonry options={{transitionDuration: 0}}>
      {people.map(person => <div key={person.id} className='masonry-item-wrapper'>
        <PersonCard person={person}
          slug={slug}
          onSkillClick={onSkillClick}
          removeMember={removeMember}
          />
      </div>)}
    </Masonry>
  </div>
}

export default PersonCards

export const PersonCard = ({ person, slug, onSkillClick, removeMember }) => {
  const {
    id, avatar_url, name, bio, isModerator, joined_at, tags, offerCount
  } = person

  const offersText = Number(offerCount) > 0
  ? `•${offerCount} offer${Number(offerCount) > 1 ? 's' : ''}`
  : null

  const avatarStyle = {backgroundImage: `url(${avatar_url})`}

  return <div className='person-card'>
    {removeMember && <Dropdown className='person-menu' alignRight
      toggleChildren={<i className='icon-More'></i>}>
      {[<li key='1'><a onClick={() => removeMember(person.id)}>Remove from community</a></li>]}
    </Dropdown>}
    <A to={`/u/${person.id}`} className='square-avatar' style={avatarStyle}/>
    <div className='person-body'>
      <A className='name' to={`/u/${id}`}>{name}</A>
      <div className='role'>
        {(isModerator ? 'Moderator' : 'Member')} since {humanDate(joined_at)}
      </div>
      {bio && <div className='details'>{bio}</div>}
      {offersText && <div className='offerCount'>{offersText}</div>}
      {!isEmpty(tags) && tags.map(tag =>
        <span key={tag}>
          <a className='hashtag' onClick={() => onSkillClick(tag)}>
            #{tag}
          </a>
          &nbsp;<wbr/>
        </span>)}
    </div>
  </div>
}
