import React from 'react'
import { connect } from 'react-redux'
import { login } from '../actions'

@connect(state => ({error: state.loginError}))
export default class Login extends React.Component {
  static propTypes = {
    error: React.PropTypes.string
  }

  submit = event => {
    event.preventDefault()
    let email = this.refs.email.value
    let password = this.refs.password.value
    this.props.dispatch(login(email, password))
  }

  render () {
    let { error } = this.props

    return <div id='login-widget'>
      <form onSubmit={this.submit}>
        <h2>Log in</h2>
        {error && <div className='alert alert-danger'>{error}</div>}
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
