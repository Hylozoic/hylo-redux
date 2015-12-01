import React from 'react'
import qs from 'querystring'
import { connect } from 'react-redux'
import { login, navigate, fetchCurrentUser, setLoginError } from '../actions'
const { bool, func, object, string } = React.PropTypes

let popup

function openPopup (service) {
  var width, height

  if (service === 'google') {
    width = 420
    height = 480
  } else if (service === 'facebook') {
    width = 560
    height = 520
  } else if (service === 'linkedin') {
    width = 400
    height = 584
  }

  // n.b. positioning of the popup is off on Chrome with multiple displays
  let left = document.documentElement.clientWidth / 2 - width / 2
  let top = document.documentElement.clientHeight / 2 - height / 2

  return window.open(
    `/noo/login/${service}?returnDomain=${window.location.origin}`,
    `${service}Auth`,
    `width=${width}, height=${height}, left=${left}, top=${top}, titlebar=no, toolbar=no, menubar=no`
  )
}

function setupPopupCallback (dispatch) {
  window.popupDone = opts => {
    let { error } = opts
    if (error) {
      dispatch(setLoginError(error))
    } else {
      dispatch(setLoginError(null))
      dispatch(fetchCurrentUser())
      popup.close()
    }
  }

  window.addEventListener('message', ({ data }) => {
    if (data.type === 'third party auth') window.popupDone(data)
  })
}

@connect(state => ({...state.login, currentUser: state.people.current}))
export default class Login extends React.Component {
  static propTypes = {
    error: string,
    success: bool,
    dispatch: func,
    currentUser: object
  }

  submit = event => {
    event.preventDefault()
    let email = this.refs.email.value
    let password = this.refs.password.value
    this.props.dispatch(login(email, password))
  }

  componentDidMount () {
    if (!window.popupDone) setupPopupCallback(this.props.dispatch)
  }

  componentDidUpdate () {
    let { currentUser, success, dispatch } = this.props
    if (success && currentUser) {
      let params = qs.parse(window.location.search.replace(/^\?/, ''))
      let next = params.next || `/u/${currentUser.id}`
      dispatch(navigate(next))
    }
  }

  startAuth = service => event => {
    popup = openPopup(service)
    event.preventDefault()
  }

  render () {
    let { error } = this.props

    return <div id='login'>
      <form onSubmit={this.submit}>
        <h2>Log in</h2>
        {error && <div className='alert alert-danger'>{error}</div>}

        <div className='service-buttons'>
          <a onClick={this.startAuth('google')} className='google'>Google</a>
          <a onClick={this.startAuth('facebook')} className='facebook'>Facebook</a>
          <a onClick={this.startAuth('linkedin')} className='linkedin'>LinkedIn</a>
        </div>

        <div className='form-group'>
          <label htmlFor='email'>Email</label>
          <input type='text' ref='email' id='email' className='form-control'/>
        </div>
        <div className='form-group'>
          <label htmlFor='password'>Password</label>
          <input type='password' ref='password' id='password' className='form-control'/>
        </div>
        <div className='form-group'>
          <input type='submit' value='Go'/>
        </div>
      </form>
    </div>
  }
}
