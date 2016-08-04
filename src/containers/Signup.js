import React from 'react'
import { pick } from 'lodash'
import { defer } from 'react-fetcher'
import { makeUrl } from '../util/navigation'
import { Link } from 'react-router'
import { signup, setSignupError, toggleLeftNav } from '../actions'
import ServiceAuthButtons from '../components/ServiceAuthButtons'
import validator from 'validator'
import { prefetchForNext, connectForNext, goToNext } from './Login'
import { STARTED_SIGNUP, trackEvent, alias } from '../util/analytics'
const { func, object, string } = React.PropTypes

@prefetchForNext
@connectForNext('signup')
@defer(() => trackEvent(STARTED_SIGNUP))
export default class Signup extends React.Component {
  static propTypes = {
    dispatch: func,
    location: object,
    error: string,
    currentUser: object,
    community: object,

    // this is set when something is wrong with the data for the community, etc.
    // that should be loaded after login
    actionError: string
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

    let { dispatch, location: { query } } = this.props
    let name = this.refs.name.value
    let email = this.refs.email.value
    let password = this.refs.password.value
    dispatch(signup(name, email, password))
    .then(({ error }) => {
      if (error) return
      const { currentUser } = this.props
      alias(currentUser.id)
      dispatch(toggleLeftNav())
      dispatch(goToNext(currentUser, query))
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

    let { actionError, location: { query }, community } = this.props

    return <div id='signup' className='login-signup simple-page'>
      <form onSubmit={this.submit}>
        <h2>Sign up</h2>
        {community && <p>To join {community.name}</p>}
        {actionError && <div className='alert alert-danger'>{actionError}</div>}
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
        Or <Link to={makeUrl('/login', pick(query, 'next', 'action', 'id', 'token'))}>log in</Link>
      </form>
    </div>
  }
}
