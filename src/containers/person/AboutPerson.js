import React from 'react'
import { connect } from 'react-redux'
import { markdown } from '../../util/text'

const AboutPerson = connect(
  (state, { params }) => ({person: state.people[params.id]})
)(({ person }) => {
  return <div className='about'>
    <section>
      <h4>About me</h4>
      <p>{person.bio}</p>
    </section>
    <section>
      <h4>What I am doing</h4>
      <p>{person.work}</p>
    </section>
    <section>
      <h4>What I would like to do</h4>
      <p>{person.intention}</p>
    </section>
    <section>
      <h4>Skills</h4>
      <ul className='tags'>
        {person.skills.map(skill =>
          <div className='tag' key={skill}>{skill}</div>)}
      </ul>
    </section>
    <section>
      <h4>Affiliations</h4>
      <ul className='tags'>
        {person.organizations.map(org =>
          <div className='tag' key={org}>{org}</div>)}
      </ul>
    </section>
    {person.extra_info && <section>
      <h4>Other information</h4>
      <div dangerouslySetInnerHTML={{__html: markdown(person.extra_info || '')}}></div>
    </section>}
  </div>
})

export default AboutPerson
