import React from 'react'
import { defer, prefetch } from 'react-fetcher'
import { get, pick, uniq } from 'lodash'
import { makeUrl } from '../client/util'
import { connect } from 'react-redux'
import {
  FETCH_COMMUNITY_FOR_INVITATION,
  fetchCommunity,
  fetchCommunityForInvitation,
  login,
  navigate,
  setLoginError
} from '../actions'
import { LOGGED_IN, STARTED_LOGIN, trackEvent } from '../util/analytics'
import { Link } from 'react-router'
import ServiceAuthButtons from '../components/ServiceAuthButtons'
const { func, object, string } = React.PropTypes

// export the decorators below so that Signup can use them as well

export const prefetchForNext = prefetch(({ query, dispatch }) => {
  switch (query.action) {
    case 'join-community':
      return dispatch(fetchCommunity(query.id))
    case 'use-invitation':
      return dispatch(fetchCommunityForInvitation(query.token))
  }
})

export const connectForNext = section =>
  connect((state, { location: { query } }) => {
    let { action, token, id } = query || {}
    let community, actionError

    switch (action) {
      case 'join-community':
        community = state.communities[id]
        break
      case 'use-invitation':
        community = state.communities[token]
        actionError = get(state.errors[FETCH_COMMUNITY_FOR_INVITATION], 'payload.response.body')
        switch (actionError) {
          case 'used token':
            actionError = 'This invitation link has already been used.'
            break
          case 'bad token':
            actionError = 'This invitation link is not valid.'
            break
        }
        break
    }

    return {
      ...state[section],
      currentUser: state.people.current,
      community,
      actionError
    }
  })

export const goToNext = (currentUser, query) => {
  let { next, action, token } = query
  if (!next) next = `/u/${currentUser.id}`
  let params
  switch (action) {
    case 'use-invitation':
      params = {token}
      break
    default:
      params = {action}
  }
  return navigate(makeUrl(next, params))
}

const displayError = error => {
  if (!error) return

  if (error === 'no user') return 'Login was canceled or no user data was found.'
  if (error === 'no email') return 'The user data did not include an email address.'

  const noPasswordMatch = error.match(/password account not found. available: \[(.*)\]/)
  if (noPasswordMatch) {
    var options = uniq(noPasswordMatch[1].split(',')
    .map(option => ({
      'google': 'Google',
      'google-token': 'Google',
      'facebook': 'Facebook',
      'facebook-token': 'Facebook',
      'linkedin': 'LinkedIn',
      'linkedin-token': 'LinkedIn'
    }[option])))
    return <span>
      Your account has no password set. <a href='/set-password'>Set your password here.</a>
    {options[0] && <span><br />Or log in with {options.join(' or ')}.</span>}
    </span>
  }
  return error
}

@prefetchForNext
@connectForNext('login')
@defer(() => trackEvent(STARTED_LOGIN))
export default class Login extends React.Component {
  static propTypes = {
    error: string,
    location: object,
    dispatch: func,
    currentUser: object,
    community: object,

    // this is set when something is wrong with the data for the community, etc.
    // that should be loaded after login
    actionError: string
  }

  submit = event => {
    let { dispatch, location: { query } } = this.props
    event.preventDefault()
    let email = this.refs.email.value
    let password = this.refs.password.value

    dispatch(login(email, password))
    .then(({ error }) => {
      if (error) return
      dispatch(goToNext(this.props.currentUser, query))
      trackEvent(LOGGED_IN)
    })
  }

  render () {
    let { error, actionError, location: { query }, community } = this.props

    error = displayError(error)

    return <div id='login' className='login-signup simple-page'>
      <form onSubmit={this.submit}>
        <h2>Log in</h2>
        {community && <p>To join {community.name}</p>}
        {actionError && <div className='alert alert-danger'>{actionError}</div>}
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
        <div>
          <Link to={makeUrl('/signup', pick(query, 'next', 'action', 'id', 'token'))}>Sign up</Link>
          &nbsp;&nbsp;•&nbsp;&nbsp;
          <Link to='/set-password'>Forgot your password?</Link>
        </div>
      </form>
    </div>
  }
}
