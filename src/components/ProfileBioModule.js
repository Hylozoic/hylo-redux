import React, { Component, PropTypes } from 'react'
import { updateUserSettings } from '../actions'
import { trackEvent, ADDED_BIO } from '../util/analytics'

const MIN_LENGTH = 1
const MAX_LENGTH = 140

export default class ProfileBioModule extends Component {
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
      maxLengthExceeded: false,
      valid: false,
      value: ''
    }
  }

  onTyping = ({ target }) => {
    const { value } = target
    const { length } = value
    const maxLengthExceeded = (length > MAX_LENGTH)
    const valid = length >= MIN_LENGTH && !maxLengthExceeded
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
    const { person } = this.props
    const { valid, length, maxLengthExceeded } = this.state
    const firstName = person.name.split(' ')[0]
    return <div className='feed-module profile-bio full-column'>
      <h2>Welcome {firstName}, help everyone get to know you a bit!</h2>
      <textarea className='form-control short' onChange={onTyping}
        placeholder={`How would you describe yourself in ${MAX_LENGTH} characters?`} />
      <div className={'text-length ' +
        (valid ? 'acceptable-length' : '') +
        (maxLengthExceeded ? 'over-max-length' : '')
      }>
        {length} / {MAX_LENGTH}
      </div>
      <button type='button' className='btn-primary' disabled={!valid} onClick={save}>
        Save
      </button>
    </div>
  }
}
