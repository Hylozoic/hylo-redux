import validator from 'validator'
import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import cx from 'classnames'
const { func, object } = React.PropTypes
import { fetchCurrentUser, updateUserSettings, leaveCommunity } from '../../actions'
import A from '../../components/A'

const formatDate = (date) => {
  var dateObj = (typeof date === 'string' ? new Date(date) : date)
  return `${dateObj.toLocaleString('en-us', { month: 'long' })} ${dateObj.getDate()}, ${dateObj.getFullYear()}`
}

@prefetch(({ dispatch, params: {id} }) => dispatch(fetchCurrentUser()))
@connect(({ people }, props) => ({currentUser: people.current}))
export default class UserSettings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {editing: {}, edited: {}, errors: {}, expand: {}}
  }

  static propTypes = {
    currentUser: object,
    dispatch: func,
    location: object
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
      errors: {...this.state.errors, email: !validator.isEmail(event.target.value)}
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

  update (field, value) {
    let { dispatch, currentUser } = this.props
    var updatedUser = {...currentUser, [field]: value}
    dispatch(updateUserSettings(updatedUser, {[field]: currentUser[field]}))
  }

  updateSetting (setting, value) {
    let { currentUser } = this.props
    let updatedSettings = {...currentUser.settings, [setting]: value}
    this.update('settings', updatedSettings)
  }

  toggle (field) {
    this.update(field, !this.props.currentUser[field])
  }

  toggleSetting (setting) {
    this.updateSetting(setting, !this.props.currentUser.settings[setting])
  }

  joinCommunity () {
    var inviteCode = window.prompt('Enter the code that was given to you by your community manager.')
    console.log(inviteCode)
  }

  leaveCommunity (communityId) {
    let { dispatch, currentUser } = this.props
    if (!window.confirm('Are you sure you want to leave this community?')) return
    dispatch(leaveCommunity(communityId, currentUser))
  }

  toggleSection (section, open) {
    let { expand } = this.state
    this.setState({expand: {...expand, [section]: open || !expand[section]}})
  }

  componentDidMount () {
    let { location: { query } } = this.props
    let { expand } = query || {}
    switch (expand) {
      case 'password':
        this.toggleSection('account', true)
        break
      case 'prompts':
        this.toggleSection('account', true)
        break
      default:
        this.toggleSection('communities', true)
        break
    }
  }

  render () {
    let { currentUser } = this.props
    let { editing, edited, errors, expand } = this.state

    return <div id='user'>
      <div className='settings'>
        <div className='section-label' onClick={() => this.toggleSection('account')}>
          Account
          <i className={cx({'icon-down': expand.account, 'icon-right': !expand.account})}></i>
        </div>
        {expand.account && <div className='section email'>
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
              <input type='checkbox' checked={currentUser.send_email_preference} onChange={() => this.toggle('send_email_preference')}/>
            </div>
          </div>
          <div className='setting-item'>
            <div className='half-column'>
              <label>Receive email digests?</label>
              <div className='summary'>Choose how frequently you would like to receive email about new activity in your communities.</div>
            </div>
            <div className='half-column value'>
              <select value={currentUser.settings.digest_frequency} ref='digest_frequency' onChange={event => this.updateSetting('digest_frequency', event.target.value)} >
                <option value='daily'>Daily</option>
                <option value='weekly'>Weekly</option>
                <option value='never'>Never</option>
              </select>
            </div>
          </div>
          <div className='setting-item'>
            <div className='half-column'>
              <label>Receive email invitations to post?</label>
              <div className='summary'>Check the circle to get a weekly email that lets you create posts without leaving your inbox.</div>
            </div>
            <div className='half-column value'>
              <input type='checkbox' checked={currentUser.settings.receives_email_prompts} onChange={() => this.toggleSetting('receives_email_prompts')}/>
            </div>
          </div>
          <div className='setting-item'>
            <div className='half-column'>
              <label>Get mobile notifications on post you are following?</label>
              <div className='summary'>Check the circle to get mobile notifications on any posts you are following.</div>
            </div>
            <div className='half-column value'>
              <input type='checkbox' checked={currentUser.push_follow_preference} onChange={() => this.toggle('push_follow_preference')}/>
            </div>
          </div>
          <div className='setting-item'>
            <div className='half-column'>
              <label>Get mobile notifications on new posts?</label>
              <div className='summary'>Check the circle to get mobile notifications on any new posts in your communities.</div>
            </div>
            <div className='half-column value'>
              <input type='checkbox' checked={currentUser.push_new_post_preference} onChange={() => this.toggle('push_new_post_preference')}/>
            </div>
          </div>
        </div>}
        <div className='section-label' onClick={() => this.toggleSection('communities')}>
          Communities
          <i className={cx({'icon-down': expand.communities, 'icon-right': !expand.communities})}></i>
        </div>
        {expand.communities && <div className='section communities'>
          {currentUser.memberships.map(membership => <div className='setting-item' key={membership.id}>
            <div className='half-column'>
              <label><A to={`/c/${membership.community.slug}`}>{membership.community.name}</A></label>
              <div className='summary'>Joined: { formatDate(membership.created_at) }</div>
            </div>
            <div className='half-column value'>
              <button onClick={() => this.leaveCommunity(membership.community_id)}>Leave</button>
            </div>
          </div>)}
          {currentUser.memberships.length === 0 && <div className='setting-item'>
            <div className='full-column'>
              <p>You do not belong to any communities yet.</p>
            </div>
          </div>}
        </div>}

        <div className='section-label' onClick={() => this.toggleSection('payment')}>
          Payment Details
          <i className={cx({'icon-down': expand.payment, 'icon-right': !expand.payment})}></i>
        </div>
        {expand.payment && <div className='section payment'>
          <div className='setting-item'>
            <div className='full-column'>
              <p>You do not belong to any communities that require a membership fee.</p>
            </div>
          </div>
        </div>}
      </div>
    </div>
  }

}
