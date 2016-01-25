import validator from 'validator'
import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import cx from 'classnames'
const { func, object, string } = React.PropTypes
import { UPLOAD_IMAGE, fetchCurrentUser, updateUserSettings, leaveCommunity, toggleUserSettingsSection } from '../../actions'
import { uploadImage } from '../../actions/uploadImage'
import A from '../../components/A'
import { formatDate } from '../../util/text'
import { debounce, get, sortBy } from 'lodash'
import { userAvatarUploadSettings, userBannerUploadSettings } from '../../constants'

@prefetch(({ dispatch, params: { id }, query }) => {
  let actions = [dispatch(fetchCurrentUser())]
  switch (query.expand) {
    case 'password':
    case 'prompts':
      actions.push(dispatch(toggleUserSettingsSection('account')))
      break
    case undefined:
      break
    default:
      actions.push(dispatch(toggleUserSettingsSection(query.expand)))
  }
  return Promise.all(actions)
})
@connect(({ people, userSettingsEditor, pending }) => ({
  pending: get(pending, `${UPLOAD_IMAGE}.subject`),
  currentUser: people.current,
  expand: {},
  ...userSettingsEditor
}))
export default class UserSettings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {editing: {}, edited: {}, errors: {}}
  }

  static propTypes = {
    currentUser: object,
    dispatch: func,
    location: object,
    expand: object,
    pending: string
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

  delayedUpdate = debounce((field, value) => this.update(field, value), 500)

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

  leaveCommunity (communityId) {
    let { dispatch, currentUser } = this.props
    if (!window.confirm('Are you sure you want to leave this community?')) return
    dispatch(leaveCommunity(communityId, currentUser))
  }

  toggleSection (section) {
    this.props.dispatch(toggleUserSettingsSection(section))
  }

  attachImage (type) {
    let { dispatch, currentUser } = this.props
    ;(() => {
      switch (type) {
        case 'avatar_url':
          return dispatch(uploadImage(userAvatarUploadSettings(currentUser)))
        case 'banner_url':
          return dispatch(uploadImage(userBannerUploadSettings(currentUser)))
      }
    })()
    .then(action => {
      let { error, payload } = action
      if (error) return
      this.update(type, payload)
    })
  }

  // we want to debounce server updating but not UI updating
  updateTyped = field => event => {
    let { value } = event.target
    let { editing } = this.state
    this.setState({editing: {...editing, [field]: value}})
    this.delayedUpdate(field, value)
  }

  render () {
    let { currentUser, expand, pending } = this.props
    let memberships = sortBy(currentUser.memberships, m => m.community.name)
    let { editing, edited, errors } = this.state
    let { avatar_url, banner_url } = currentUser

    let { bio, work, intention } = {...currentUser, ...editing}

    const SectionLabel = ({ name, label }) => {
      return <div className='section-label' onClick={() => this.toggleSection(name)}>
        {label} <i className={cx({'icon-down': expand[name], 'icon-right': !expand[name]})}></i>
      </div>
    }

    return <div id='user-settings' className='form-sections'>
      <SectionLabel name='profile' label='Profile'/>
      {expand.profile && <Section className='profile'>
        <Item>
          <div className='half-column'>
            <label>Profile image</label>
          </div>
          <div className='half-column right-align'>
            <div className='medium-avatar' style={{backgroundImage: `url(${avatar_url})`}}/>
            <button type='button' onClick={() => this.attachImage('avatar_url')}
              disabled={pending === 'user-avatar'}>
              {pending === 'user-avatar' ? 'Please wait...' : 'Change'}
            </button>
          </div>
        </Item>
        <Item>
          <div className='full-column'>
            <label>Banner</label>
            <div className='banner' style={{backgroundImage: `url(${banner_url})`}}></div>
          </div>
          <div className='full-column right-align'>
            <button type='button' onClick={() => this.attachImage('banner_url')}
              disabled={pending === 'user-banner'}>
              {pending === 'user-banner' ? 'Please wait...' : 'Change'}
            </button>
          </div>
        </Item>
        <Item>
          <div className='full-column'>
            <label>About me</label>
            <textarea className='form-control short' value={bio} onChange={this.updateTyped('bio')}></textarea>
          </div>
        </Item>
        <Item>
          <div className='full-column'>
            <label>What I'm doing</label>
            <textarea className='form-control short' value={work} onChange={this.updateTyped('work')}></textarea>
          </div>
        </Item>
        <Item>
          <div className='full-column'>
            <label>What I'd like to do</label>
            <textarea className='form-control short' value={intention} onChange={this.updateTyped('intention')}></textarea>
          </div>
        </Item>
      </Section>}
      <SectionLabel name='account' label='Account'/>
      {expand.account && <Section className='email'>
        <Item>
          <div className='half-column'>
            <label>Your Email</label>
            <p>{currentUser.email}</p>
          </div>
          {!editing.email && <div className='half-column right-align'>
            <button type='button' onClick={() => this.edit('email')}>Change</button>
          </div>}
          {editing.email && <div className='half-column right-align'>
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
        </Item>
        <Item>
          <div className='half-column'>
            <label>Your Password</label>
          </div>
          {!editing.password && <div className='half-column right-align'>
            <button type='button' onClick={() => this.edit('password')}>Change</button>
          </div>}
          {editing.password && <div className='half-column right-align'>
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
        </Item>
        <Item>
          <div className='half-column'>
            <label>Receive email notifications?</label>
            <div className='summary'>Check the circle to get updates on posts you create or follow. You can also change this for each post individually.</div>
          </div>
          <div className='half-column right-align'>
            <input type='checkbox' checked={currentUser.send_email_preference} onChange={() => this.toggle('send_email_preference')}/>
          </div>
        </Item>
        <Item>
          <div className='half-column'>
            <label>Receive email digests?</label>
            <div className='summary'>Choose how frequently you would like to receive email about new activity in your communities.</div>
          </div>
          <div className='half-column right-align'>
            <select value={currentUser.settings.digest_frequency} ref='digest_frequency' onChange={event => this.updateSetting('digest_frequency', event.target.value)} >
              <option value='daily'>Daily</option>
              <option value='weekly'>Weekly</option>
              <option value='never'>Never</option>
            </select>
          </div>
        </Item>
        <Item>
          <div className='half-column'>
            <label>Receive email invitations to post?</label>
            <div className='summary'>Check the circle to get a weekly email that lets you create posts without leaving your inbox.</div>
          </div>
          <div className='half-column right-align'>
            <input type='checkbox' checked={currentUser.settings.receives_email_prompts} onChange={() => this.toggleSetting('receives_email_prompts')}/>
          </div>
        </Item>
        <Item>
          <div className='half-column'>
            <label>Get mobile notifications on posts you are following?</label>
            <div className='summary'>Check the circle to get mobile notifications on any posts you are following.</div>
          </div>
          <div className='half-column right-align'>
            <input type='checkbox' checked={currentUser.push_follow_preference} onChange={() => this.toggle('push_follow_preference')}/>
          </div>
        </Item>
        <Item>
          <div className='half-column'>
            <label>Get mobile notifications on new posts?</label>
            <div className='summary'>Check the circle to get mobile notifications on any new posts in your communities.</div>
          </div>
          <div className='half-column right-align'>
            <input type='checkbox' checked={currentUser.push_new_post_preference} onChange={() => this.toggle('push_new_post_preference')}/>
          </div>
        </Item>
      </Section>}
      <SectionLabel name='communities' label='Communities'/>
      {expand.communities && <Section className='communities'>
        {memberships.map(membership => <Item key={membership.id}>
          <div className='half-column'>
            <label><A to={`/c/${membership.community.slug}`}>{membership.community.name}</A></label>
            <div className='summary'>Joined: { formatDate(membership.created_at) }</div>
          </div>
          <div className='half-column right-align'>
            <button onClick={() => this.leaveCommunity(membership.community_id)}>Leave</button>
          </div>
        </Item>)}
        {memberships.length === 0 && <Item>
          <div className='full-column'>
            <p>You do not belong to any communities yet.</p>
          </div>
        </Item>}
      </Section>}
      <SectionLabel name='payment' label='Payment Details'/>
      {expand.payment && <Section className='payment'>
        <Item>
          <div className='full-column'>
            <p>You do not belong to any communities that require a membership fee.</p>
          </div>
        </Item>
      </Section>}
    </div>
  }
}

const Section = ({className, children}) =>
  <div className={cx('section', className)}>{children}</div>

const Item = ({className, children}) =>
  <div className={cx('section-item', className)}>{children}</div>
