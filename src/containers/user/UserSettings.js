import validator from 'validator'
import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import cx from 'classnames'
const { func, object, string } = React.PropTypes
import {
  UPLOAD_IMAGE,
  updateUserSettings,
  leaveCommunity,
  toggleUserSettingsSection,
  typeahead
 } from '../../actions'
import { uploadImage } from '../../actions/uploadImage'
import A from '../../components/A'
import { formatDate } from '../../util/text'
import { debounce, get, sortBy } from 'lodash'
import TagInput from '../../components/TagInput'
import { userAvatarUploadSettings, userBannerUploadSettings } from '../../constants'
import { openPopup, setupPopupCallback, PROFILE_CONTEXT } from '../../util/auth'

@prefetch(({ dispatch, params: { id }, query }) => {
  switch (query.expand) {
    case 'password':
    case 'prompts':
      return dispatch(toggleUserSettingsSection('account', true))
    case undefined:
      break
    default:
      return dispatch(toggleUserSettingsSection(query.expand, true))
  }
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

  componentDidMount () {
    if (!window.popupDone) setupPopupCallback(this.props.dispatch)
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

  update = (field, value) => {
    let { dispatch, currentUser } = this.props
    var updatedUser = {...currentUser, [field]: value}
    dispatch(updateUserSettings(updatedUser, {[field]: currentUser[field]}))
  }

  delayedUpdate = debounce((field, value) => this.update(field, value), 2000)

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
    let { currentUser, expand, pending, dispatch } = this.props
    let memberships = sortBy(currentUser.memberships, m => m.community.name)
    let { editing, edited, errors } = this.state
    let { avatar_url, banner_url } = currentUser
    let {
      bio, work, intention, extra_info,
      facebook_url, twitter_name, linkedin_url
    } = {...currentUser, ...editing}

    return <div id='user-settings' className='form-sections'>
      <SectionLabel name='profile' label='Profile' {...{dispatch, expand}}/>
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
        <Item className='social-media'>
          <div className='full-column'>
            <label>Social media links</label>
          </div>
          <div className='third-column'>
            <h5>Facebook</h5>
            {facebook_url && <LinkButton href={facebook_url} icon='facebook'/>}
            <button onClick={() => openPopup('facebook', PROFILE_CONTEXT)}>
              {facebook_url ? 'Change' : 'Connect'}
            </button>
          </div>
          <div className='third-column'>
            <h5>Twitter</h5>
            {twitter_name && <LinkButton href={`https://twitter.com/${twitter_name}`} icon='twitter'/>}
            <input type='text' className='form-control' value={twitter_name}
              onChange={event => this.update('twitter_name', event.target.value)}/>
          </div>
          <div className='third-column'>
            <h5>LinkedIn</h5>
            {linkedin_url && <LinkButton href={linkedin_url} icon='linkedin'/>}
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
            <label>What I'm doing</label>
            <textarea className='form-control short' value={work}
              onChange={this.updateTyped('work')}></textarea>
          </div>
        </Item>
        <Item>
          <div className='full-column'>
            <label>What I'd like to do</label>
            <textarea className='form-control short' value={intention}
              onChange={this.updateTyped('intention')}></textarea>
          </div>
        </Item>
        <Item>
          <div className='full-column'>
            <label>Skills</label>
            <ListItemTagInput type='skills' person={currentUser} update={this.update}/>
          </div>
        </Item>
        <Item>
          <div className='full-column'>
            <label>Affiliations</label>
            <ListItemTagInput type='organizations' person={currentUser} update={this.update}/>
          </div>
        </Item>
        <Item>
          <div className='full-column'>
            <label>Other information</label>
            <textarea className='form-control' value={extra_info}
              onChange={this.updateTyped('extra_info')}></textarea>
            <span className='meta'>
              <a href='http://cdn.hylo.com/misc/markdown.html' target='_blank'>Markdown</a> is supported.
            </span>
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

      <SectionLabel name='communities' label='Communities' {...{dispatch, expand}}/>
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

      <SectionLabel name='payment' label='Payment Details' {...{dispatch, expand}}/>
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

const ListItemTagInput = connect(
  ({ typeaheadMatches }, { type }) => ({matches: get(typeaheadMatches, type)})
)(({ dispatch, matches, type, person, update }) => {
  let list = person[type] || []
  let tags = list.map(x => ({id: x, name: x}))
  let add = item => update(type, list.concat(item.name))
  let remove = item => update(type, list.filter(x => x !== item.name))

  return <TagInput
    choices={matches}
    tags={tags}
    allowNewTags={true}
    handleInput={value => dispatch(typeahead(value, type, {type}))}
    onSelect={add}
    onRemove={remove}/>
})

const LinkButton = ({ href, icon }) =>
  <a className='button' href={href} target='_blank'><i className={`icon-${icon}`}></i></a>
