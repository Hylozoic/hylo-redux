import React from 'react'
import A from '../components/A'
import Dropdown from '../components/Dropdown'
import Masonry from 'react-masonry-component'

const PersonCards = ({ people, menus, subtitles }) => {
  return <div className='person-cards masonry-container'>
    <Masonry options={{transitionDuration: 0}}>
      {people.map(person => <div key={person.id} className='masonry-item-wrapper'>
        <PersonCard person={person}
          menu={menus && menus[person.id]}
          subtitle={subtitles && subtitles[person.id]}/>
      </div>)}
    </Masonry>
  </div>
}

export default PersonCards

export const PersonCard = ({ person, menu, subtitle }) => {
  let { id, avatar_url, name, bio, isModerator } = person
  return <div className='person-card'>
    {menu && <Dropdown className='caret-menu' alignRight={true}
      toggleChildren={<i className='icon-down'></i>}>
      {menu}
    </Dropdown>}
    <A to={`/u/${person.id}`}>
      <div className='large-avatar' style={{backgroundImage: `url(${avatar_url})`}}/>
    </A>
    <br/>
    <A className='name' to={`/u/${id}`}>{name}</A>
    {isModerator && <div className='moderator'>Moderator</div>}
    {subtitle && <div className='subtitle'>{subtitle}</div>}
    {bio && <div className='details'>{bio}</div>}
  </div>
}
