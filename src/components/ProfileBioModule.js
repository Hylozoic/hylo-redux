import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { trackEvent, ADDED_BIO } from '../util/analytics'
import { updateUserSettings } from '../actions'

class ProfileBioModule extends Component {
  static propTypes = {
    person: PropTypes.object
  }

  static contextTypes = {
    dispatch: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {
      length: 0,
      maxLength: 140,
      maxLengthReached: false
    }
  }

  onTyping = ({ target }) => {
    const { maxLength } = this.state
    const text = target.value
    const { length } = text
    this.setState({
      text,
      length,
      maxLengthReached: (length > maxLength)
    })
  }

  save = () => {
    const { text } = this.state
    const { dispatch } = this.props
    trackEvent(ADDED_BIO, {context: 'onboarding'})
    return dispatch(updateUserSettings({bio: text}))
  }

  render () {
    const { onTyping, save } = this
    const { length, maxLength, maxLengthReached } = this.state
    const { person } = this.props
    return <div className='feed-module profile-bio full-column'>
      <h2>Welcome {person.name}, help everyone get to know you a bit!</h2>
      <textarea className='form-control short' onChange={onTyping}
        placeholder='How would you describe yourself in 140 characters?'>
      </textarea>
      <button type='button' className='btn-primary'
        disabled={maxLengthReached} onClick={save}>
        Save
      </button>
      <div className={'text-length ' + (maxLengthReached ? 'over-max-length' : '')}>
        {length} / {maxLength}
      </div>
    </div>
  }
}
