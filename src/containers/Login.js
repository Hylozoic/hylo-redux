import React from 'react'
import { defer, prefetch } from 'react-fetcher'
import { get, isEmpty, pick, uniq } from 'lodash'
import { makeUrl } from '../util/navigation'
import { connect } from 'react-redux'
import {
  FETCH_COMMUNITY_FOR_INVITATION,
  FETCH_POST,
  continueLogin,
  finishLogin,
  login,
  navigate,
  resetError,
  setLoginError
} from '../actions'
import { fetchCommunity, fetchCommunityForInvitation } from '../actions/communities'
import {
  LOGGED_IN, STARTED_LOGIN, LOGIN_ATTEMPTED, LOGIN_FAILED, alias, trackEvent
} from '../util/analytics'
import { Link } from 'react-router'
import ServiceAuthButtons from '../components/ServiceAuthButtons'
import { communityUrl } from '../routes'
const { func, object, string } = React.PropTypes
import ModalOnlyPage from '../components/ModalOnlyPage'
import { ModalInput } from '../components/ModalRow'
import Modal from '../components/Modal'
import { denormalizedCurrentUser } from '../models/currentUser'
import { getCommunity } from '../models/community'

// export the decorators below so that Signup can use them as well

export const prefetchForNext = prefetch(({ query, dispatch }) => {
  switch (query.action) {
    case 'join-community':
    case 'join-community-tag':
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

    return {...state[section], community, actionError}
  }, null, null, {withRef: true})

export const displayError = error => {
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
    community: object,
    // this is set when something is wrong with the data for the community, etc.
    // that should be loaded after login
    actionError: string
  }

  submit = event => {
    let { dispatch, location: { query } } = this.props
    event.preventDefault()
    let email = this.refs.email.getValue()
    let password = this.refs.password.getValue()
    trackEvent(LOGIN_ATTEMPTED, {provider: 'password'})
    return dispatch(login(email, password))
    .then(({ error, payload }) => {
      if (error) {
        const reason = this.props.error.split('.')[0]
        trackEvent(LOGIN_FAILED, {provider: 'password', reason})
        return
      }
      this.refs.password.blur()
      dispatch(continueLogin(query))
      trackEvent(LOGGED_IN, {provider: 'password'})
    })
  }

  render () {
    const { actionError, location: { query }, community } = this.props
    const error = displayError(this.props.error)
    const signupUrl = makeUrl('/signup', pick(query, 'next', 'action', 'id', 'token', 'email'))
    const { email } = query

    const title = <span><div className='hylo-logo' />Log in to hylo</span>

    return <ModalOnlyPage id='login' className='login-signup'>
      {community && <div className='modal-topper'>
        <div className='medium-avatar' style={{backgroundImage: `url(${community.avatar_url})`}} />
        <h2>Join {community.name}</h2>
      </div>}
      <Modal title={title} standalone>
        <form onSubmit={this.submit}>
          {actionError && <div className='alert alert-danger'>{actionError}</div>}
          {error && <div className='alert alert-danger'>{error}</div>}
          <div className='oauth'>
            <ServiceAuthButtons errorAction={setLoginError} />
          </div>
          <ModalInput label='Email' ref='email' defaultValue={email} />
          <ModalInput label='Password' ref='password' type='password' />
          <div className='footer'>
            <input ref='submit' type='submit' value='Log in' />
            <div className='right'>
              <Link to={signupUrl}>Sign up</Link>
              &nbsp;&nbsp;•&nbsp;&nbsp;
              <Link to='/set-password'>Forgot your password?</Link>
            </div>
          </div>
        </form>
      </Modal>
      <PostLoginRedirector />
    </ModalOnlyPage>
  }
}

@connect((state, props) => {
  const currentUser = denormalizedCurrentUser(state)
  if (!currentUser) return {}

  const currentCommunityId = get(currentUser, 'settings.currentCommunityId')
  const community = getCommunity(currentCommunityId, state)

  var fallbackUrl
  if (community) {
    fallbackUrl = communityUrl(community)
  } else if (isEmpty(currentUser.memberships)) {
    fallbackUrl = '/create'
  } else {
    fallbackUrl = `/u/${currentUser.id}`
  }

  return {login: state.login, currentUser, fallbackUrl}
}, null, null, {withRef: true})
export class PostLoginRedirector extends React.Component {
  static propTypes = {
    dispatch: func,
    login: object,
    currentUser: object,
    fallbackUrl: string
  }

  componentDidUpdate () {
    const { dispatch, login, currentUser, fallbackUrl } = this.props
    const { shouldRedirect, query } = login || {}
    if (shouldRedirect && currentUser) {
      alias(currentUser.id)
      // if we were trying to log in from a single-post page, we need to clear
      // this error so that we can view it after being redirected
      dispatch(resetError(FETCH_POST))
      dispatch(navigate(nextUrl(query, fallbackUrl)))
      dispatch(finishLogin())
    }
  }

  render () {
    return null
  }
}

const nextUrl = (query, fallbackUrl) => {
  let { next, action, token } = query || {}
  if (!next) next = fallbackUrl
  const params = action === 'use-invitation' ? {token} : {action}
  return makeUrl(next, params)
}
