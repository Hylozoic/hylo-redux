import React from 'react'
import { openPopup, setupPopupCallback } from '../util/auth'
const { func } = React.PropTypes

const startAuth = service => event => {
  openPopup(service)
  event.preventDefault()
}

export default class ServiceAuthButtons extends React.Component {
  static propTypes = {
    dispatch: func,
    errorAction: func.isRequired
  }

  componentDidMount () {
    let { dispatch, errorAction } = this.props
    if (!window.popupDone) setupPopupCallback(dispatch, errorAction)
  }

  render () {
    return <div className='service-buttons'>
      <a onClick={startAuth('google')} className='google'>Google</a>
      <a onClick={startAuth('facebook')} className='facebook'>Facebook</a>
      <a onClick={startAuth('linkedin')} className='linkedin'>LinkedIn</a>
    </div>
  }
}
