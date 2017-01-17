import React from 'react'
import { pick } from 'lodash'
import { defer } from 'react-fetcher'
import { makeUrl } from '../util/navigation'
import { Link } from 'react-router'
import { continueLogin, signup, setSignupError, toggleLeftNav } from '../actions'
import ServiceAuthButtons from '../components/ServiceAuthButtons'
import CommunityHeader from '../components/CommunityHeader'
import Modal from '../components/Modal'
import ModalOnlyPage from '../components/ModalOnlyPage'
import { ModalInput } from '../components/ModalRow'
import validator from 'validator'
import { prefetchForNext, connectForNext, PostLoginRedirector } from './Login'
import { STARTED_SIGNUP, trackEvent } from '../util/analytics'
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
    let name = this.refs.name.getValue()
    if (!name) {
      this.setState({error: 'Your name cannot be blank.'})
      return false
    }

    let email = this.refs.email.getValue()
    if (!validator.isEmail(email)) {
      this.setState({error: 'Enter a valid email address.'})
      return false
    }

    let password = this.refs.password.getValue()
    if (!password) {
      this.setState({error: 'Your password cannot be blank.'})
      return false
    }

    return true
  }

  submit = event => {
    event.preventDefault()
    if (!this.validate()) return

    const { dispatch, location: { query } } = this.props
    const name = this.refs.name.getValue()
    const email = this.refs.email.getValue()
    const password = this.refs.password.getValue()
    dispatch(signup(name, email, password))
    .then(({ error }) => {
      if (error) return
      dispatch(toggleLeftNav())
      dispatch(continueLogin(query))
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

    const { actionError, location: { query }, community } = this.props
    const loginUrl = makeUrl('/login', pick(query, 'next', 'action', 'id', 'token', 'email'))
    const { email, next } = query
    const willCreateJoinRequest = next && 
      (next.indexOf('join=true') > -1 || next.indexOf('join%3Dtrue') > -1)
    let subtitle = `If you're trying to join an existing community, please use the special
        invitation link that you received from your community manager.`
    if (willCreateJoinRequest) {
      subtitle = 'Once you sign up, a request to join the community will be sent.'
    } else if (community) {
      subtitle = ''
    }
        
    return <ModalOnlyPage id='signup' className='login-signup'>
      <div className='logo-wrapper'><div className='hylo-logo' /></div>
      <CommunityHeader community={community} />
      <Modal title='Create your account' subtitle={subtitle} standalone>
        <form onSubmit={this.submit}>
          {actionError && <div className='alert alert-danger'>{actionError}</div>}
          {error && <div className='alert alert-danger'>{error}</div>}

          <div className='oauth'>
            <label>Connect with</label>
            <ServiceAuthButtons errorAction={setSignupError} />
          </div>

          <h4>Or sign up with email</h4>

          <ModalInput label='Full name' ref='name' />
          <ModalInput label='Email' ref='email' defaultValue={email} />
          <ModalInput label='Password' ref='password' type='password' />
          <div className='footer'>
            <input type='submit' value='Sign up' />
            <div className='right'>
              Or <Link to={loginUrl}>log in</Link>
            </div>
          </div>
        </form>
      </Modal>
      <PostLoginRedirector />
    </ModalOnlyPage>
  }
}
