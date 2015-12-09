import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import cx from 'classnames'
const { func, object } = React.PropTypes
import { fetchCurrentUser, updateUserSettings, updateUserSettingsEditor } from '../../actions'

@prefetch(({ dispatch, params: {id} }) => dispatch(fetchCurrentUser()))
@connect(({ people }, props) => ({currentUser: people.current}))
export default class UserSettings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {editing: {}, edited: {}, errors: {}}
  }

  static propTypes = {
    currentUser: object,
    dispatch: func,
    location: object
  }

  updateStore (data) {
    let { dispatch } = this.props
    dispatch(updateUserSettingsEditor(data))
  }

  validate () {
    let { errors } = this.state

    if (errors.email) {
      window.alert('Please provide a valid email.')
      this.refs.email.focus()
      return
    }

    if (errors.password) {
      window.alert('Please provide a valid password.')
      this.refs.password.focus()
      return
    }

    return true
  }

  setEmail = event => {
    return this.setState({
      edited: {...this.state.edited, email: event.target.value},
      errors: {...this.state.errors, email: !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(event.target.value)}
    })
  }

  setPassword = event => {
    return this.setState({
      edited: {...this.state.edited, password: event.target.value},
      errors: {...this.state.errors, password: !event.target.value}
    })
  }

  save = (field) => {
    if (!this.validate()) return

    let { dispatch, currentUser } = this.props
    let { editing, edited } = this.state
    this.setState({editing: {...editing, [field]: false}})
    dispatch(updateUserSettingsEditor({...currentUser, ...edited}))
    dispatch(updateUserSettings({...currentUser, ...edited}, {[field]: currentUser[field]}))
  }

  edit (field) {
    let { currentUser } = this.props
    let { editing, edited } = this.state
    edited[field] = currentUser[field]
    this.setState({editing: {...editing, [field]: true}})
  }

  cancelEdit (field) {
    let { editing } = this.state
    this.setState({editing: {...editing, [field]: false}})
  }

  toggle (field) {
    let { dispatch, currentUser } = this.props
    var updatedUser = {...currentUser, ...{[field]: !currentUser[field]}}
    dispatch(updateUserSettingsEditor(updatedUser))
    dispatch(updateUserSettings(updatedUser, {[field]: currentUser[field]}))
  }

  toggleSettings (field) {

  }

  componentDidMount () {
    let { location: { query } } = this.props
    let { expand } = query || {}
    switch (expand) {
      case 'password':
        this.setState({expand1: true, editing: {password: true}})
        break
      case 'prompts':
        this.setState({expand1: true})
        break
    }
  }

  render () {
    let { currentUser } = this.props
    let { editing, edited, errors, expand1 } = this.state

    return <div id='user'>
      <div className='settings'>
        <div className='section-label' onClick={() => this.setState({expand1: !expand1})}>
          Account
          <i className={cx({'icon-down': expand1, 'icon-right': !expand1})}></i>
        </div>
        {expand1 && <div className='section email'>
          <div className='setting-item'>
            <div className='half-column'>
              <label>Your Email</label>
              <p>{currentUser.email}</p>
            </div>
            {!editing.email && <div className='half-column value'>
              <button type='button' onClick={() => this.edit('email')}>Change</button>
            </div>}
            {editing.email && <div className='half-column value'>
              <form name='emailForm'>
                <div className={cx('form-group', {'has-error': errors.email})}>
                  <input type='text' ref='email' className='email form-control'
                    value={edited.email}
                    onChange={this.setEmail}/>
                  </div>
              </form>
              <div className='buttons'>
                <button type='button' onClick={() => this.cancelEdit('email')}>Cancel</button>
                <button type='button' className='btn-primary' onClick={() => this.save('email')}>Save</button>
              </div>
            </div>}
          </div>
          <div className='setting-item'>
            <div className='half-column'>
              <label>Your Password</label>
            </div>
            {!editing.password && <div className='half-column value'>
              <button type='button' onClick={() => this.edit('password')}>Change</button>
            </div>}
            {editing.password && <div className='half-column value'>
              <form name='passwordForm'>
                <div className={cx('form-group', {'has-error': errors.password})}>
                <p className='help'>Enter a new password.</p>
                  <input type='password' ref='password' className='password form-control'
                    value={edited.password}
                    onChange={this.setPassword}/>
                  </div>
              </form>
              <div className='buttons'>
                <button type='button' onClick={() => this.cancelEdit('password')}>Cancel</button>
                <button type='button' className='btn-primary' onClick={() => this.save('password')}>Save</button>
              </div>
            </div>}
          </div>
          <div className='setting-item'>
            <div className='half-column'>
              <label>Receive email notifications?</label>
              <div className='summary'>Check the circle to get updates on posts you create or follow. You can also change this for each post individually.</div>
            </div>
            <div className='half-column value'>
              <input type='checkbox' checked={currentUser.send_email_preference} onClick={() => this.toggle('send_email_preference')}/>
            </div>
          </div>

        </div>}
      </div>
    </div>
  }

}
