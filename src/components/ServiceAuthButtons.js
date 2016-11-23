import React from 'react'
import { connect } from 'react-redux'
import { openPopup, setupPopupCallback, LOGIN_CONTEXT } from '../util/auth'
import { LOGIN_ATTEMPTED, trackEvent } from '../util/analytics'
const { func } = React.PropTypes

const startAuth = provider => event => {
  trackEvent(LOGIN_ATTEMPTED, {provider})
  openPopup(provider, LOGIN_CONTEXT)
  event.preventDefault()
}

@connect()
export default class ServiceAuthButtons extends React.Component {
  static propTypes = {
    dispatch: func,
    errorAction: func.isRequired
  }

  componentDidMount () {
    let { dispatch, errorAction } = this.props
    setupPopupCallback('login-signup', dispatch, errorAction)
  }

  render () {
    return <div className='service-buttons'>
      <a onClick={startAuth('google')} className='google'>Google</a>
      <a onClick={startAuth('facebook')} className='facebook'>Facebook</a>
      <a onClick={startAuth('linkedin')} className='linkedin'>LinkedIn</a>
    </div>
  }
}
