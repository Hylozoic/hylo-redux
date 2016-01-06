import React from 'react'
import qs from 'querystring'
import { connect } from 'react-redux'
import { login, navigate, setLoginError } from '../actions'
import { Link } from 'react-router'
import ServiceAuthButtons from '../components/ServiceAuthButtons'
const { bool, func, object, string } = React.PropTypes

@connect(({login, people}) => ({...login, currentUser: people.current}))
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

  componentDidUpdate () {
    let { currentUser, success, dispatch } = this.props
    if (success && currentUser) {
      let params = qs.parse(window.location.search.replace(/^\?/, ''))
      let next = params.next || `/u/${currentUser.id}`
      dispatch(navigate(next))
    }
  }

  render () {
    let { error } = this.props

    return <div id='login' className='login-signup'>
      <form onSubmit={this.submit}>
        <h2>Log in</h2>
        {error && <div className='alert alert-danger'>{error}</div>}

        <ServiceAuthButtons errorAction={setLoginError}/>

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
        <Link to='/signup'>Sign up</Link>
      </form>
    </div>
  }
}
