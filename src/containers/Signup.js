import React from 'react'
import { pick } from 'lodash'
import { makeUrl } from '../client/util'
import { Link } from 'react-router'
import { signup, setSignupError } from '../actions'
import ServiceAuthButtons from '../components/ServiceAuthButtons'
import validator from 'validator'
import { prefetchForNext, connectForNext, goToNext } from './Login'
const { func, object, string } = React.PropTypes

@prefetchForNext
@connectForNext('signup')
export default class Signup extends React.Component {
  static propTypes = {
    dispatch: func,
    location: object,
    error: string,
    currentUser: object,
    project: object,
    community: object
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

    let { dispatch, location: { query }, currentUser } = this.props
    let name = this.refs.name.value
    let email = this.refs.email.value
    let password = this.refs.password.value
    dispatch(signup(name, email, password))
    .then(({ error }) => error || dispatch(goToNext(currentUser, query)))
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

    let { location: { query }, project, community } = this.props

    return <div id='signup' className='login-signup'>
      <form onSubmit={this.submit}>
        <h2>Sign up</h2>
        {project && <p>To join the project "{project.title}"</p>}
        {community && <p>To join {community.name}</p>}
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
        Or <Link to={makeUrl('/login', pick(query, 'next', 'action', 'id'))}>log in</Link>
      </form>
    </div>
  }
}
