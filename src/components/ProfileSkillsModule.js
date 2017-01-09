import React, { Component, PropTypes } from 'react'
import { updateCurrentUser, notify } from '../actions'
import ListItemTagInput from './ListItemTagInput'

export default class ProfileSkillsModule extends Component {
  static propTypes = {
    person: PropTypes.object
  }

  static contextTypes = {
    dispatch: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {
      tags: [],
      valid: false
    }
  }

  update = (type, tags) => {
    const valid = tags.length > 0
    return this.setState({
      tags,
      valid
    })
  }

  save = () => {
    const { tags } = this.state
    const { dispatch } = this.context
    return Promise.all([
      dispatch(updateCurrentUser({tags})),
      dispatch(notify('Skills added successfully.', {type: 'info'}))
    ])
  }

  render () {
    const { update, save } = this
    const { person } = this.props
    const { valid } = this.state
    const firstName = person.name.split(' ')[0]
    return <div className='feed-module profile-skills'>
      <h2>
        Welcome {firstName}! Are there any skills, passions or interests
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
      <button type='button' className='btn-primary' disabled={!valid} onClick={save}>
        Save
      </button>
    </div>
  }
}
