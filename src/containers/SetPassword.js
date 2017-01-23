import React from 'react'
import { connect } from 'react-redux'
import { setPassword } from '../actions'
import { Link } from 'react-router'
const { func } = React.PropTypes

@connect()
export default class SetPassword extends React.Component {

  constructor (props) {
    super(props)
    this.state = {}
  }

  static propTypes = {
    dispatch: func
  }

  submit = event => {
    const { dispatch } = this.props
    this.setState({error: null, message: null})
    event.preventDefault()
    dispatch(setPassword(this.refs.email.value))
    .then(({payload}) => {
      if (payload.error === 'no user') {
        this.setState({error: 'The email address you entered was not recognized.'})
      } else {
        this.setState({message: 'Please click the link in the email that we just sent you.'})
      }
    })
  }

  render () {
    const { error, message } = this.state
    return <div className='simple-page login-signup'>
      <form onSubmit={this.submit}>
        <h2>Set your password</h2>
        {error && <div className='alert alert-danger'>{error}</div>}
        {message && <div className='alert alert-success'>{message}</div>}
        <p className='help'>Enter your email address to receive a link to set your password.</p>
        <div className='form-group'>
          <input type='text' id='email' ref='email' className='form-control' placeholder='Email address' />
        </div>
        <div className='form-group'>
          <input type='submit' value='Go' />
        </div>
        <div>
          <Link to='/signup'>Sign up</Link>
          &nbsp;&nbsp;•&nbsp;&nbsp;
          <Link to='/login'>Log in</Link>
        </div>
      </form>
    </div>
  }
}
