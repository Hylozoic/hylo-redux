import React from 'react'
import { connect } from 'react-redux'
const { func } = React.PropTypes
import { updateUserSettings } from '../actions'
import ListItemTagInput from './ListItemTagInput'

function ProfileBioModule ({ person, dispatch }) {
  const update = ((path, value) => dispatch(updateUserSettings({[path]: value})))
  const save = () => {}
  return <div className='feed-module profile-bio full-column'>
    <h2>Welcome {person.name}, help everyone get to know you a bit!</h2>
    <textarea className='form-control short'
      placeholder='How would you describe yourself in 140 characters?'>
    </textarea>
    <button type='button' className='btn-primary' onClick={save}>Save</button>
  </div>
}

export default connect()(ProfileBioModule)
