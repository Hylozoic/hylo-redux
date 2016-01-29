import React from 'react'
import { prefetch } from 'react-fetcher'
import { pick } from 'lodash'
import { makeUrl } from '../client/util'
import { connect } from 'react-redux'
import { fetchCommunity, login, navigate, setLoginError } from '../actions'
import { fetchProject } from '../actions/project'
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
  }
})

export const connectForNext = section =>
  connect((state, { location: { query } }) => {
    let { action, id } = query || {}
    return {
      ...state[section],
      currentUser: state.people.current,
      project: action === 'join-project' ? state.projects[id] : null,
      community: action === 'join-community' ? state.communities[id] : null
    }
  })

export const goToNext = (currentUser, query) => {
  let next = query.next || `/u/${currentUser.id}`
  let url = makeUrl(next, {action: query.action})
  return navigate(url)
}

@prefetchForNext
@connectForNext('login')
export default class Login extends React.Component {
  static propTypes = {
    error: string,
    location: object,
    dispatch: func,
    currentUser: object,
    project: object,
    community: object
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
    let { error, location: { query }, project, community } = this.props

    return <div id='login' className='login-signup'>
      <form onSubmit={this.submit}>
        <h2>Log in</h2>
        {project && <p>To join the project "{project.title}"</p>}
        {community && <p>To join {community.name}</p>}
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
        Or <Link to={makeUrl('/signup', pick(query, 'next', 'action', 'id'))}>sign up</Link>
      </form>
    </div>
  }
}
