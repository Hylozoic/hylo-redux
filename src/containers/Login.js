import React from 'react'
import { prefetch } from 'react-fetcher'
import { pick } from 'lodash'
import { makeUrl } from '../client/util'
import { connect } from 'react-redux'
import { login, navigate, setLoginError } from '../actions'
import { fetchProject } from '../actions/project'
import { Link } from 'react-router'
import ServiceAuthButtons from '../components/ServiceAuthButtons'
const { func, object, string } = React.PropTypes

@prefetch(({ query, dispatch }) => {
  if (query.action === 'join-project') {
    return dispatch(fetchProject(query.id))
  }
})
@connect(({ login, people, projects }, { location: { query } }) => ({
  ...login,
  currentUser: people.current,
  project: query.action === 'join-project' ? projects[query.id] : null
}))
export default class Login extends React.Component {
  static propTypes = {
    error: string,
    location: object,
    dispatch: func,
    currentUser: object,
    project: object
  }

  submit = event => {
    let { dispatch, location: { query } } = this.props
    event.preventDefault()
    let email = this.refs.email.value
    let password = this.refs.password.value

    dispatch(login(email, password))
    .then(action => {
      if (action.error) return
      let next = query.next || `/u/${this.props.currentUser.id}`
      let url = makeUrl(next, {action: query.action})
      dispatch(navigate(url))
    })
  }

  render () {
    let { error, location: { query }, project } = this.props

    return <div id='login' className='login-signup'>
      <form onSubmit={this.submit}>
        <h2>Log in</h2>
        {project && <p>To join the project "{project.title}"</p>}
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
        <Link to={makeUrl('/signup', pick(query, 'next', 'action', 'id'))}>Sign up</Link>
      </form>
    </div>
  }
}
