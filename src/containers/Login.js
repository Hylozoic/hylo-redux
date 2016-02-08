import React from 'react'
import { defer, prefetch } from 'react-fetcher'
import { get, pick } from 'lodash'
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
import { fetchProject } from '../actions/project'
import { STARTED_LOGIN, trackEvent } from '../util/analytics'
import { Link } from 'react-router'
import ServiceAuthButtons from '../components/ServiceAuthButtons'
const { func, object, string } = React.PropTypes

// export the decorators below so that Signup can use them as well

export const prefetchForNext = prefetch(({ query, dispatch }) => {
  switch (query.action) {
    case 'join-project':
      return dispatch(fetchProject(query.id))
    case 'join-community':
      return dispatch(fetchCommunity(query.id))
    case 'use-invitation':
      return dispatch(fetchCommunityForInvitation(query.token))
  }
})

export const connectForNext = section =>
  connect((state, { location: { query } }) => {
    let { action, token, id } = query || {}
    let project, community, actionError

    switch (action) {
      case 'join-project':
        project = state.projects[id]
        break
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
      project,
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

@prefetchForNext
@connectForNext('login')
@defer(() => trackEvent(STARTED_LOGIN))
export default class Login extends React.Component {
  static propTypes = {
    error: string,
    location: object,
    dispatch: func,
    currentUser: object,
    project: object,
    community: object,

    // this is set when something is wrong with the data for the project,
    // community, etc. that should be loaded after login
    actionError: string
  }

  submit = event => {
    let { dispatch, location: { query }, currentUser } = this.props
    event.preventDefault()
    let email = this.refs.email.value
    let password = this.refs.password.value

    dispatch(login(email, password))
    .then(({ error }) => error || dispatch(goToNext(currentUser, query)))
  }

  render () {
    let { error, actionError, location: { query }, project, community } = this.props

    return <div id='login' className='login-signup'>
      <form onSubmit={this.submit}>
        <h2>Log in</h2>
        {project && <p>To join the project "{project.title}"</p>}
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
        Or <Link to={makeUrl('/signup', pick(query, 'next', 'action', 'id', 'token'))}>sign up</Link>
      </form>
    </div>
  }
}
