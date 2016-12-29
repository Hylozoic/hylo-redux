import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { updateUserSettings } from '../actions'
import ListItemTagInput from './ListItemTagInput'

class ProfileSkillsModule extends Component {
  static propTypes = {
    person: PropTypes.object
  }

  static contextTypes = {
    dispatch: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {
      tags: []
    }
  }

  update = (type, tags) => this.setState({tags})

  save = () => {
    const { tags } = this.state
    const { dispatch } = this.props
    return dispatch(updateUserSettings({tags}))
  }

  render () {
    const { update, save } = this
    const { person } = this.props
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
      <div className='meta'>
        Press Enter (Return) after each tag. Use a dash (-) between words in a tag.
      </div>
      <button type='button' className='btn-primary' onClick={save}>Save</button>
    </div>
  }
}
