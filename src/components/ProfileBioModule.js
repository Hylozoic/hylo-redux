import React, { Component, PropTypes } from 'react'
import { updateUserSettings } from '../actions'
import { trackEvent, ADDED_BIO } from '../util/analytics'

export default class ProfileBioModule extends Component {
  static propTypes = {
    person: PropTypes.object
  }

  static contextTypes = {
    dispatch: PropTypes.func
  }

  constructor (props) {
    super(props)
    const firstName = props.person.name.split(' ')[0]
    this.state = {
      firstName,
      length: 0,
      minLength: 1,
      maxLength: 140,
      maxLengthExceeded: false,
      valid: false,
      value: ''
    }
  }

  onTyping = ({ target }) => {
    const { maxLength, minLength } = this.state
    const { value } = target
    const { length } = value
    const maxLengthExceeded = (length > maxLength)
    const valid = length >= minLength && !maxLengthExceeded
    this.setState({
      value,
      length,
      maxLengthExceeded,
      valid
    })
  }

  save = () => {
    const { value } = this.state
    const { dispatch } = this.context
    trackEvent(ADDED_BIO, {context: 'onboarding'})
    return dispatch(updateUserSettings({bio: value}))
  }

  render () {
    const { onTyping, save } = this
    const { firstName, valid, length, maxLength, maxLengthExceeded } = this.state
    return <div className='feed-module profile-bio full-column'>
      <h2>Welcome {firstName}, help everyone get to know you a bit!</h2>
      <textarea className='form-control short' onChange={onTyping}
        placeholder={`How would you describe yourself in ${maxLength} characters?`} />
      <div className={'text-length ' +
        (valid ? 'acceptable-length' : '') +
        (maxLengthExceeded ? 'over-max-length' : '')
      }>
        {length} / {maxLength}
      </div>
      <button type='button' className='btn-primary' disabled={!valid} onClick={save}>
        Save
      </button>
    </div>
  }
}
