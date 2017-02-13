import React, { PropTypes } from 'react'
import PersonCard from './PersonCard'
import Masonry from 'react-masonry-component'

export default function PersonCards ({ people, slug, onSkillClick, removeMember }) {
  return <div className='person-cards masonry-container'>
    <Masonry options={{transitionDuration: 0}}>
      {people.map(person => <div key={person.id} className='masonry-item-wrapper'>
        <PersonCard person={person}
          slug={slug}
          onSkillClick={onSkillClick}
          removeMember={removeMember} />
      </div>)}
    </Masonry>
  </div>
}
PersonCards.propTypes = {
  people: PropTypes.array.isRequired,
  slug: PropTypes.string,
  onSkillClick: PropTypes.func,
  removeMember: PropTypes.func
}
