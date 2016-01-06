import React from 'react'
import Promise from 'bluebird'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import cx from 'classnames'
const { object, func, array } = React.PropTypes
import { find, reduce } from 'lodash'
import { markdown } from '../../util/text'
import {
  updateCommunitySettings,
  fetchCommunitySettings,
  fetchCommunityModerators,
  addCommunityModerator,
  removeCommunityModerator,
  validateCommunityCode
} from '../../actions'
import { uploadImage } from '../../actions/uploadImage'
import PersonChooser from '../../components/PersonChooser'

const avatarUploadSettings = community => ({
  id: community.slug,
  subject: 'community-avatar',
  path: `community/${community.id}/avatar`,
  convert: {width: 160, height: 160, fit: 'crop', rotate: 'exif'}
})

const bannerUploadSettings = community => ({
  id: community.slug,
  subject: 'community-banner',
  path: `community/${community.id}/banner`,
  convert: {width: 1600, format: 'jpg', fit: 'max', rotate: 'exif'}
})

@prefetch(({dispatch, params: {id}}) =>
  Promise.join(
    dispatch(fetchCommunitySettings(id)),
    dispatch(fetchCommunityModerators(id))
  )
)
@connect((state, { params }) => ({community: state.communities[params.id]}))
export default class CommunitySettings extends React.Component {

  constructor (props) {
    super(props)
    this.state = {editing: {}, edited: {}, errors: {}, expand: {}}
  }

  static propTypes = {
    community: object,
    dispatch: func,
    location: object,
    people: array
  }

  setEditState = (field, value, errors) =>
    this.setState({
      edited: {...this.state.edited, [field]: value},
      errors: {...this.state.errors, [field]: errors}
    })

  setName = event => this.setEditState('name', event.target.value, !event.target.value)

  setDescription = event => this.setEditState('description', event.target.value)

  setWelcomeMessage = event => this.setEditState('welcome', event.target.value)

  setLocation = event => this.setEditState('location', event.target.value)

  setBetaAccessCode = event => {
    let { dispatch, community } = this.props
    let code = event.target.value

    if (code && code !== community.beta_access_code) {
      dispatch(validateCommunityCode(code, community.slug))
    }

    let empty = !code
    let errors = empty ? {empty: empty} : {}
    return this.setEditState('beta_access_code', code, errors)
  }

  validate () {
    let { errors } = this.state

    if (errors.name) {
      window.alert('Please provide a community name.')
      this.refs.name.focus()
      return
    }

    if (errors.beta_access_code) {
      if (errors.beta_access_code.not_unique) {
        window.alert('This code cannot be used; please choose another.')
        this.refs.beta_access_code.focus()
        return
      }
      if (errors.beta_access_code.empty) {
        window.alert('Please fill in a code.')
        this.refs.beta_access_code.focus()
        return
      }
    }

    return true
  }

  save = (...args) => {
    if (!this.validate()) return
    let { dispatch, community } = this.props
    let { editing, edited } = this.state
    let newEditing = reduce(args, (m, field) => { m[field] = false; return m }, {})
    let oldSettings = reduce(args, (m, field) => { m[field] = community[field]; return m }, {})
    this.setState({editing: {...editing, ...newEditing}})
    dispatch(updateCommunitySettings({...community, ...edited}, oldSettings))
  }

  edit = (...args) => {
    let { community } = this.props
    let { editing, edited } = this.state
    let newEditing = reduce(args, (m, field) => { m[field] = true; return m }, {})
    let newEdited = reduce(args, (m, field) => { m[field] = community[field]; return m }, {})
    this.setState({
      editing: {...editing, ...newEditing},
      edited: {...edited, ...newEdited}
    })
  }

  cancelEdit = (...args) => {
    let { editing } = this.state
    let newEditing = reduce(args, (m, field) => { m[field] = false; return m }, {})
    this.setState({editing: {...editing, ...newEditing}})
  }

  attachImage (type) {
    let { dispatch, community } = this.props
    switch (type) {
      case 'avatar':
        return dispatch(uploadImage(avatarUploadSettings(community)))
      case 'banner':
        return dispatch(uploadImage(bannerUploadSettings(community)))
    }
  }

  update (field, value) {
    let { dispatch, community } = this.props
    var updatedCommunity = {...community, [field]: value}
    dispatch(updateCommunitySettings(updatedCommunity, {[field]: community[field]}))
  }

  // some settings are child attributes of the community object, and some are
  // nested inside an attribute called "settings". yes, this is confusing.
  updateNested (setting, value) {
    let { community } = this.props
    let updatedSettings = {...community.settings, [setting]: value}
    this.update('settings', updatedSettings)
  }

  toggle (field) {
    this.update(field, !this.props.community[field])
  }

  toggleNested (setting) {
    this.updateNested(setting, !this.props.community.settings[setting])
  }

  toggleSection = (section, open) => {
    let { expand } = this.state
    this.setState({expand: {...expand, [section]: open || !expand[section]}})
  }

  addModerator = person => {
    let { dispatch, community } = this.props
    dispatch(addCommunityModerator(community, person, { moderators: community.moderators }))
  }

  removeModerator (id) {
    let { dispatch, community } = this.props
    let moderators = community.moderators
    var moderator = find(moderators, m => m.id === id)
    if (window.confirm(`Are you sure you wish to remove ${moderator.name}'s moderator powers?`)) {
      dispatch(removeCommunityModerator(community, id, { moderators }))
    }
  }

  changeLeader = person => {
    let { edited } = this.state
    this.setState({edited: {...edited, leader: person}})
  }

  componentDidMount () {
    let { location: { query } } = this.props
    let { expand } = query || {}
    if (expand) this.toggleSection(expand, true)
  }

  componentDidUpdate () {
    let { dispatch, community } = this.props
    let { edited: { beta_access_code }, errors } = this.state
    let { triggerUpdate } = community
    if (triggerUpdate) {
      dispatch(updateCommunitySettings({...community, triggerUpdate: false}))
    }
    if (!(errors.beta_access_code && errors.beta_access_code.not_unique) &&
      community.validation &&
      community.validation.beta_access_code &&
      !community.validation.beta_access_code.unique &&
      community.validation.beta_access_code.code === beta_access_code) {
      this.setState({errors: {...errors, beta_access_code: {not_unique: true}}})
    }
  }

  render () {
    let { community } = this.props
    let { avatar_url, banner_url } = community
    let { editing, edited, errors, expand } = this.state
    let labelProps = {expand, toggle: this.toggleSection}
    let joinUrl

    if (expand.access) {
      let origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.hylo.com'
      joinUrl = `${origin}/c/${community.slug}/join/${community.beta_access_code}`
    }

    return <div className='form-sections' id='community-settings'>
      <SectionLabel name='appearance' {...labelProps}>Appearance</SectionLabel>
      {expand.appearance && <div className='section appearance'>
        <div className='section-item'>
          <div className='half-column'>
            <label>Name</label>
            <p>{community.name}</p>
          </div>
          {editing.name
            ? <div className='half-column value'>
                <form name='nameForm'>
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
              </div>
            : <div className='half-column value'>
                <button type='button' onClick={() => this.edit('name')}>Change</button>
              </div>}
        </div>

        <div className='section-item description'>
          <div className='full-column'>
            <label>Core Intention / About</label>
          </div>
          {editing.description
            ? <div className='full-column'>
                <form name='nameForm'>
                  <div className={cx('form-group', {'has-error': errors.description})}>
                    <textarea className='form-control description'
                      value={edited.description}
                      onChange={this.setDescription}/>
                    </div>
                </form>
                <div className='buttons'>
                  <button type='button' onClick={() => this.cancelEdit('description')}>Cancel</button>
                  <button type='button' className='btn-primary' onClick={() => this.save('description')}>Save</button>
                </div>
              </div>
            : <div className='full-column'>
                <div className='description-value' dangerouslySetInnerHTML={{__html: markdown(community.description)}}></div>
                <button type='button' onClick={() => this.edit('description')}>Change</button>
              </div>}
        </div>

        <div className='section-item icon'>
          <div className='half-column'>
            <label>Icon</label>
            <p className='summary'>This image appears next to your community's name. (Tip: Try a transparent PNG image.)</p>
          </div>
          <div className='half-column value'>
            <div className='community-logo' style={{backgroundImage: `url(${avatar_url})`}}/>
            <button type='button' onClick={() => this.attachImage('avatar')}>Change</button>
          </div>
        </div>

        <div className='section-item'>
          <div className='full-column'>
            <label>Banner</label>
            <p className='summary'>This image appears at the top of your community page. (Suggested size: 1400x500 pixels.)</p>
            <div className='community-banner' style={{backgroundImage: `url(${banner_url})`}}></div>
          </div>
          <div className='full-column value'>
            <button type='button' onClick={() => this.attachImage('banner')}>Change</button>
          </div>
        </div>

        <div className='section-item welcome-message'>
          <div className='full-column'>
            <label>Welcome message</label>
            <p className='summary'>This text is shown on the first screen that a new member sees.</p>
          </div>
          {editing.welcome_message
            ? <div className='full-column edit'>
                <textarea className='form-control'
                  value={edited.welcome_message}
                  onChange={this.setWelcomeMessage}
                  rows='4'
                  placeholder='Enter a welcome message.'>
                </textarea>
                {edited.leader && <p className='summary'>{edited.leader.name}&#39;s image will be shown. Search for someone else:</p>}
                {!edited.leader && <p className='summary'>Search by name for a community leader, whose image will be shown:</p>}
                <PersonChooser
                  onSelect={this.changeLeader}
                  communityId={community.id}
                  typeaheadId='leader'/>
                <div className='buttons'>
                  <button type='button' onClick={() => this.cancelEdit('welcome_message', 'leader')}>Cancel</button>
                  <button type='button' onClick={() => this.save('welcome_message', 'leader')}>Save</button>
                </div>
              </div>
            : <div className='full-column'>
                {community.leader && <div className='leader'>
                  <div className='medium-avatar' style={{backgroundImage: `url(${community.leader.avatar_url})`}}></div>
                  <div className='name'>{community.leader.name}</div>
                </div>}
                <p>{community.welcome_message || '[Not set yet]'}</p>
                <div className='buttons'><button type='button' onClick={() => this.edit('welcome_message', 'leader')}>Change</button></div>
              </div>}
        </div>

        <div className='section-item'>
          <div className='half-column'>
            <label>Location</label>
            <p>{community.location || 'You haven\'t specified a location yet.'}</p>
          </div>
          {editing.location
            ? <div className='half-column value'>
                <form name='nameForm'>
                  <div className={cx('form-group', {'has-error': errors.location})}>
                    <input type='text' ref='location' className='location form-control'
                      value={edited.location}
                      onChange={this.setLocation}/>
                    </div>
                </form>
                <div className='buttons'>
                  <button type='button' onClick={() => this.cancelEdit('location')}>Cancel</button>
                  <button type='button' className='btn-primary' onClick={() => this.save('location')}>Save</button>
                </div>
              </div>
            : <div className='half-column value'>
                <button type='button' onClick={() => this.edit('location')}>Change</button>
              </div>}
        </div>
      </div>}

      <SectionLabel name='access' {...labelProps}>Access</SectionLabel>
      {expand.access && <div className='section access'>
        <div className='section-item'>
          <div className='half-column'>
            <label>Allow everyone to invite new members</label>
            <p className='summary'>If this is disabled, only moderators may send invitations to new members.</p>
          </div>
          <div className='half-column value'>
            <input type='checkbox' checked={community.settings.all_can_invite} onChange={() => this.toggleNested('all_can_invite')}/>
          </div>
        </div>
        <div className='section-item'>
          <div className='half-column'>
            <label>Invitation code</label>
            <p>{community.beta_access_code || '&nbsp;'}</p>
            <p className='summary'>This code can be given to people to allow them to join the community, instead of sending individual invitations by email.</p>
          </div>
          <div className='half-column'>
            <label>Invitation code link</label>
            <p><a href={joinUrl}>{joinUrl}</a></p>
            <p className='summary'>You can copy this link for pasting in emails or embedding on your webpage to pre-populate the invite code for new members to easily join.</p>
          </div>
          {editing.beta_access_code
            ? <div className='half-column edit'>
                <form>
                  <input name='beta_access_code' ref='beta_access_code' type='text' className='form-control' value={edited.beta_access_code} onChange={this.setBetaAccessCode} />
                </form>
                {errors.beta_access_code && errors.beta_access_code.empty && <p className='summary error'>Please fill in a code.</p>}
                {errors.beta_access_code && errors.beta_access_code.not_unique && <p className='summary error'>This code cannot be used; please choose another.</p>}
                <button type='button' onClick={() => this.cancelEdit('beta_access_code')}>Cancel</button>
                <button type='button' onClick={() => this.save('beta_access_code')}>Save</button>
              </div>
            : <div className='half-column value'>
                <button type='button' onClick={() => this.edit('beta_access_code')}>Change</button>
              </div>}
        </div>
      </div>}

      <SectionLabel name='moderators' {...labelProps}>Moderators</SectionLabel>
      {expand.moderators && <div className='section moderators'>
        <div className='section-item'>
          <div className='full-column'>
            <p>
              Moderators can&nbsp;
              {community.settings.all_can_invite && <span>invite new members and </span>}
              edit or delete other members&#39; posts.
            </p>

            {community.moderators.map(moderator => <div className='moderator' key={moderator.id}>
              <a><span className='avatar' style={{backgroundImage: `url(${moderator.avatar_url})`}}></span></a>
              <a className='name'>{moderator.name}</a>
              <a className='close' onClick={() => this.removeModerator(moderator.id)}>&times;</a>
            </div>)}

            <p>Search for members to grant moderator powers:</p>
            <PersonChooser
              onSelect={this.addModerator}
              communityId={community.id}
              typeaheadId='moderator'/>
          </div>
        </div>
      </div>}

      <SectionLabel name='email' {...labelProps}>Email</SectionLabel>
      {expand.email && <div className='section email'>
        <div className='section-item'>
          <div className='half-column'>
            <label>Send a weekly email inviting members to post?</label>
            <p className='summary'>If this is checked, each week members will receive an email that they can reply to with their offers, requests and intentions.</p>
          </div>
          <div className='half-column value'>
            <input type='checkbox' checked={community.settings.sends_email_prompts} onChange={() => this.toggleNested('sends_email_prompts')}/>
          </div>
        </div>
      </div>}

    </div>
  }
}

const SectionLabel = ({name, children, expand, toggle}) => {
  const expanded = expand[name]
  return <div className='section-label' onClick={() => toggle(name)}>
    {children}
    <i className={cx({'icon-down': expanded, 'icon-right': !expanded})}></i>
  </div>
}
