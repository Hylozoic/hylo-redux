import React from 'react'
import qs from 'querystring'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { navigate, signup, setSignupError } from '../actions'
import ServiceAuthButtons from '../components/ServiceAuthButtons'
import validator from 'validator'
const { func, object, string } = React.PropTypes

@connect(({signup, people}) => ({...signup, currentUser: people.current}))
export default class Signup extends React.Component {
  static propTypes = {
    dispatch: func,
    error: string,
    currentUser: object
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  validate () {
    this.setState({error: null})
    let name = this.refs.name.value
    if (!name) {
      this.setState({error: 'Your name cannot be blank.'})
      return false
    }

    let email = this.refs.email.value
    if (!validator.isEmail(email)) {
      this.setState({error: 'Enter a valid email address.'})
      return false
    }

    let password = this.refs.password.value
    if (!password) {
      this.setState({error: 'Your password cannot be blank.'})
      return false
    }

    return true
  }

  submit = event => {
    event.preventDefault()
    if (!this.validate()) return

    let { dispatch } = this.props
    let name = this.refs.name.value
    let email = this.refs.email.value
    let password = this.refs.password.value
    dispatch(signup(name, email, password))
    .then(action => {
      if (action.error) return
      let params = qs.parse(window.location.search.replace(/^\?/, ''))
      let next = params.next || `/u/${this.props.currentUser.id}`
      dispatch(navigate(next))
    })
  }

  render () {
    let error = this.props.error || this.state.error
    if (error) {
      let match = error.match(/Key \((.*)\)=\((.*)\) already exists/)
      if (match) {
        error = <span>
          The {match[1]} "{match[2]}" is already in use.
          Try <Link to='/login'>logging in</Link> instead?
        </span>
      }
    }

    return <div id='signup' className='login-signup'>
      <form onSubmit={this.submit}>
        <h2>Sign up</h2>
        {error && <div className='alert alert-danger'>{error}</div>}

        <ServiceAuthButtons errorAction={setSignupError}/>

        <div className='form-group'>
          <label htmlFor='name'>Full name</label>
          <input type='text' ref='name' id='name' className='form-control'/>
        </div>
        <div className='form-group email'>
          <label htmlFor='email'>Email</label>
          <input type='text' ref='email' id='email' className='form-control'/>
        </div>
        <div className='form-group password'>
          <label htmlFor='password'>Password</label>
          <input type='password' ref='password' id='password' className='form-control'/>
        </div>
        <div className='form-group'>
          <input type='submit' value='Go'/>
        </div>
        <Link to='/login'>Log in</Link>
      </form>
    </div>
  }
}
