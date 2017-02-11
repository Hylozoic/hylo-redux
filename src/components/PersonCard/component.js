import React from 'react'
import { isEmpty } from 'lodash'
import { humanDate } from '../../util/text'
import A from '../A'
import Dropdown from '../Dropdown'

export default function PersonCard ({ person, slug, onSkillClick, removeMember, onMouseOver }) {
  const {
    id, avatar_url, name, bio, isModerator, joined_at, tags, offerCount
  } = person

  const offersText = Number(offerCount) > 0
  ? `•${offerCount} offer${Number(offerCount) > 1 ? 's' : ''}`
  : null

  const avatarStyle = {backgroundImage: `url(${avatar_url})`} // eslint-disable-line

  return <div className='person-card'>
    {removeMember && <Dropdown className='person-menu' alignRight
      toggleChildren={<i className='icon-More' />}>
      {[<li key='1'><a onClick={() => removeMember(person.id)}>Remove from community</a></li>]}
    </Dropdown>}
    <span><A to={`/u/${person.id}`} className='square-avatar' style={avatarStyle} /></span>
    <div className='person-body'>
      <span onMouseOver={onMouseOver}>
        <A className='name' to={`/u/${id}`}>{name}</A>
      </span>
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
          &nbsp;<wbr />
        </span>)}
    </div>
  </div>
}
