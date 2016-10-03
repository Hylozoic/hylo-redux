import validator from 'validator'
import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import cx from 'classnames'
const { func, object, string } = React.PropTypes
import {
  UPLOAD_IMAGE,
  notify,
  toggleUserSettingsSection,
  updateMembershipSettings,
  updateUserSettings
 } from '../../actions'
import { leaveCommunity } from '../../actions/communities'
import { uploadImage } from '../../actions/uploadImage'
import A from '../../components/A'
import { formatDate } from '../../util/text'
import { debounce, get, sortBy, throttle, set } from 'lodash'
import ListItemTagInput from '../../components/ListItemTagInput'
import { hasFeature } from '../../models/currentUser'
import { avatarUploadSettings, bannerUploadSettings, defaultBanner } from '../../models/person'
import { openPopup, setupPopupCallback, PROFILE_CONTEXT } from '../../util/auth'
import { EDITED_USER_SETTINGS, trackEvent } from '../../util/analytics'
import { preventSpaces } from '../../util/textInput'
import Icon from '../../components/Icon'

@prefetch(({ dispatch, params: { id }, query }) => {
  switch (query.expand) {
    case 'password':
      dispatch(toggleUserSettingsSection('account', true))
      return dispatch(toggleUserSettingsSection('password', true))
    case 'prompts':
      return dispatch(toggleUserSettingsSection('account', true))
    case undefined:
      break
    default:
      return dispatch(toggleUserSettingsSection(query.expand, true))
  }
})
@connect(({ userSettingsEditor, pending }) => ({
  pending: get(pending, `${UPLOAD_IMAGE}.subject`),
  expand: {},
  ...userSettingsEditor
}))
export default class UserSettings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {editing: {}, edited: {}, errors: {}}
  }

  static propTypes = {
    dispatch: func,
    location: object,
    expand: object,
    pending: string
  }
  static contextTypes = {currentUser: object}

  componentDidMount () {
    setupPopupCallback('settings', this.props.dispatch)
    if (this.props.expand.password) {
      this.setState({editing: {
        ...this.state.editing,
        password: true
      }})
    }
  }

  validate () {
    let { errors } = this.state

    if (errors.name) {
      window.alert('Please provide a valid name.')
      this.refs.name.focus()
      return
    }

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

  setName = event => {
    return this.setState({
      edited: {...this.state.edited, name: event.target.value},
      errors: {...this.state.errors, name: !event.target.value}
    })
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

    let { editing, edited } = this.state
    this.setState({editing: {...editing, [field]: false}})
    this.update(field, edited[field])
  }

  edit (field) {
    let { currentUser } = this.context
    let { editing, edited } = this.state
    edited[field] = currentUser[field]
    this.setState({editing: {...editing, [field]: true}})
  }

  cancelEdit (field) {
    let { editing } = this.state
    this.setState({editing: {...editing, [field]: false}})
  }

  update = (path, value) => {
    let { dispatch } = this.props
    dispatch(updateUserSettings(set({}, path, value)))
    .then(({ error, payload }) => error && dispatch(notify(payload.message, {type: 'error'})))
    this.trackEdit()
  }

  // throttle edit events to once per minute, because updates can happen while a
  // user is editing a text field, etc.
  trackEdit = throttle(() => trackEvent(EDITED_USER_SETTINGS), 60000)

  delayedUpdate = debounce((path, value) => this.update(path, value), 2000)

  toggle (path) {
    let { currentUser } = this.context
    this.update(path, !get(currentUser, path))
  }

  updateMembership = (membership, path, value) => {
    const { dispatch } = this.props
    const params = set({}, path, value)
    dispatch(updateMembershipSettings(membership.community_id, params))
    this.trackEdit()
  }

  membershipToggle = (membership, path) => {
    this.updateMembership(membership, path, !get(membership, path))
  }

  leaveCommunity = (communityId, name) => {
    const { dispatch } = this.props
    if (!window.confirm(`Are you sure you want to leave ${name}?`)) return
    dispatch(leaveCommunity(communityId))
  }

  attachImage (type) {
    const { dispatch } = this.props
    const { currentUser } = this.context
    ;(() => {
      switch (type) {
        case 'avatar_url':
          return dispatch(uploadImage(avatarUploadSettings(currentUser)))
        case 'banner_url':
          return dispatch(uploadImage(bannerUploadSettings(currentUser)))
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
    const { currentUser } = this.context
    let { expand, pending, dispatch } = this.props
    let memberships = sortBy(currentUser.memberships, m => m.community.name)
    let { editing, edited, errors } = this.state
    let { avatar_url, banner_url } = currentUser
    if (!banner_url) banner_url = defaultBanner
    let {
      bio, location, url, facebook_url, twitter_name, linkedin_url
    } = {...currentUser, ...editing}

    return <div id='user-settings' className='form-sections simple-page'>
      <SectionLabel name='profile' label='Profile' {...{dispatch, expand}}/>
      {expand.profile && <Section className='profile'>
        <Item>
          <div className='half-column'>
            <label>Your Name</label>
            <p>{currentUser.name}</p>
          </div>
          {!editing.name && <div className='half-column right-align'>
            <button type='button' onClick={() => this.edit('name')}>Change</button>
          </div>}
          {editing.name && <div className='half-column right-align'>
            <form name='emailForm'>
              <div className={cx('form-group', {'has-error': errors.name})}>
                <input type='text' ref='name' className='name form-control'
                  value={edited.name}
                  onChange={this.setName}/>
                </div>
            </form>
            <div className='buttons'>
              <button type='button' onClick={() => this.cancelEdit('name')}>Cancel</button>
              <button type='button' className='btn-primary' onClick={() => this.save('name')}>Save</button>
            </div>
          </div>}
        </Item>
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
        <Item className='social-media'>
          <div className='full-column'>
            <label>Social media links</label>
          </div>
          <div className='third-column'>
            <h5>Facebook</h5>
            <LinkButton disabled={!facebook_url} href={facebook_url} icon='facebook'/>
            <button onClick={() => openPopup('facebook', PROFILE_CONTEXT)}>
              {facebook_url ? 'Change' : 'Connect'}
            </button>
          </div>
          <div className='third-column'>
            <h5>Twitter</h5>
            <LinkButton disabled={!twitter_name} href={`https://twitter.com/${twitter_name}`} icon='twitter'/>
            <input type='text' className='form-control' value={twitter_name}
              onChange={this.updateTyped('twitter_name')}/>
          </div>
          <div className='third-column'>
            <h5>LinkedIn</h5>
            <LinkButton disabled={!linkedin_url} href={linkedin_url} icon='linkedin'/>
            <button onClick={() => openPopup('linkedin', PROFILE_CONTEXT)}>
              {linkedin_url ? 'Change' : 'Connect'}
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
            <textarea className='form-control short' value={bio}
              onChange={this.updateTyped('bio')}></textarea>
          </div>
        </Item>
        <Item>
          <div className='full-column'>
            <label>My skills</label>
            <ListItemTagInput type='tags' person={currentUser}
              update={this.update} filter={preventSpaces}/>
          </div>
        </Item>
        <Item>
          <div className='full-column'>
            <label>My website</label>
            <input className='form-control' type='text'
              defaultValue={url} onChange={this.updateTyped('url')}/>
          </div>
        </Item>
        <Item>
          <div className='full-column'>
            <label>My geographical location</label>
            <input className='form-control' type='text'
              defaultValue={location} onChange={this.updateTyped('location')}/>
          </div>
        </Item>
      </Section>}

      <SectionLabel name='account' label='Account' {...{dispatch, expand}}/>
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
            <label>Receive email digests?</label>
            <div className='summary'>Choose how frequently you would like to receive email about new activity in your communities.</div>
          </div>
          <div className='half-column right-align'>
            <select value={currentUser.settings.digest_frequency} ref='digest_frequency' onChange={event => this.update('settings.digest_frequency', event.target.value)} >
              <option value='daily'>Daily</option>
              <option value='weekly'>Weekly</option>
              <option value='never'>Never</option>
            </select>
          </div>
        </Item>
      </Section>}

      <SectionLabel name='communities' label='Communities' {...{dispatch, expand}}/>
      {expand.communities && <Section className='communities'>
        {memberships.map(membership => <MembershipSettings key={membership.id}
          membership={membership}
          toggle={this.membershipToggle}
          leave={this.leaveCommunity}/>)}
        {memberships.length === 0 && <Item>
          <div className='full-column'>
            <p>You do not belong to any communities yet.</p>
          </div>
        </Item>}
      </Section>}

      {hasFeature(currentUser, 'PAYMENT_SETTINGS') && <div>
        <SectionLabel name='payment' label='Payment Details' {...{dispatch, expand}}/>
        {expand.payment && <Section className='payment'>
          <Item>
            <div className='full-column'>
              <p>You do not belong to any communities that require a membership fee.</p>
            </div>
          </Item>
        </Section>}
      </div>}
    </div>
  }
}

const SectionLabel = ({ name, label, dispatch, expand }) => {
  return <div className='section-label'
    onClick={() => dispatch(toggleUserSettingsSection(name))}>
    {label} <i className={cx({'icon-down': expand[name], 'icon-right': !expand[name]})}></i>
  </div>
}

const Section = ({className, children}) =>
  <div className={cx('section', className)}>{children}</div>

const Item = ({className, children}) =>
  <div className={cx('section-item', className)}>{children}</div>

const LinkButton = ({ href, icon, ...props }) =>
  <a {...props} className='button' href={href} target='_blank'>
    <Icon name={icon}/>
  </a>

const MembershipSettings = ({ membership, toggle, leave }) => {
  const { community, created_at } = membership
  const { id, name, slug } = community
  return <div>
    <Item>
      <div className='half-column'>
        <label>
          <A to={`/c/${slug}`}>{name}</A>
        </label>
        <div className='summary'>
          Joined {formatDate(created_at)}
        </div>
      </div>
      <div className='half-column right-align'>
        <div className='notification-settings'>
          <p>Receive notifications:</p>
          <label>
            <input type='checkbox' checked={get(membership, 'settings.send_email')}
              onChange={() => toggle(membership, 'settings.send_email')}/>
            Email
          </label>
          <label>
            <input type='checkbox' checked={get(membership, 'settings.send_push_notifications')}
              onChange={() => toggle(membership, 'settings.send_push_notifications')}/>
            Mobile
          </label>
        </div>
        <button onClick={() => leave(id, name)}>Leave community</button>
      </div>
    </Item>
  </div>
}
