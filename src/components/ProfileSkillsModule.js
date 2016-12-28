import React from 'react'
import { connect } from 'react-redux'
const { func } = React.PropTypes
import { updateUserSettings } from '../actions'
import ListItemTagInput from './ListItemTagInput'

function ProfileSkillsModule ({ person, dispatch }) {
  const update = ((path, value) => dispatch(updateUserSettings({[path]: value})))
  const save = () => { return true }
  return <div className='feed-module profile-skills'>
    <h2>
      Welcome {person.name}! Are there any skills, passions or interests
      you’d like to be known for in the community?
    </h2>
    <p>
      Pick “tags” to describe yourself and to find people and opportunities
      that match your interests.
    </p>
    <ListItemTagInput
      type='tags'
      className='modal-input'
      person={person}
      update={update}
      context='feed-module' />
    <span className='meta'>
      Press Enter (Return) after each tag. Use a dash (-) between words in a tag.
    </span>
    <button type='button' className='btn-primary' onClick={save}>Save</button>
  </div>
}

export default connect()(ProfileSkillsModule)
