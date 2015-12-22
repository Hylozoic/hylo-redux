import React from 'react'
import Promise from 'bluebird'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import cx from 'classnames'
const { object, func, array } = React.PropTypes
import { find } from 'lodash'
import { markdown } from '../../util/text'
import { updateCommunitySettings, fetchCommunitySettings, fetchCommunityModerators, addCommunityModerator, removeCommunityModerator, validateCommunityCode } from '../../actions'
import { uploadImage } from '../../actions/uploadImage'
import PersonChooser from '../../components/PersonChooser'

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

  setName = event => {
    return this.setState({
      edited: {...this.state.edited, name: event.target.value},
      errors: {...this.state.errors, name: !event.target.value}
    })
  }

  setDescription = event => {
    return this.setState({
      edited: {...this.state.edited, description: event.target.value}
    })
  }

  setWelcomeMessage = event => {
    return this.setState({
      edited: {...this.state.edited, welcome_message: event.target.value}
    })
  }

  setLocation = event => {
    return this.setState({
      edited: {...this.state.edited, location: event.target.value}
    })
  }

  setBetaAccessCode = event => {
    let { dispatch, community } = this.props
    let code = event.target.value

    if (code && code !== community.beta_access_code) {
      dispatch(validateCommunityCode(code, community.slug))
    }

    let empty = !code
    let errors = empty ? {empty: empty} : {}
    return this.setState({
      edited: {...this.state.edited, beta_access_code: code},
      errors: {...this.state.errors, beta_access_code: errors}
    })
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

  save = field => {
    if (!this.validate()) return
    let { dispatch, community } = this.props
    let { editing, edited } = this.state
    this.setState({editing: {...editing, [field]: false}})
    dispatch(updateCommunitySettings({...community, ...edited}, {[field]: community[field]}))
  }

  edit = field => {
    let { community } = this.props
    let { editing, edited } = this.state
    this.setState({
      editing: {...editing, [field]: true},
      edited: {...edited, [field]: community[field]}
    })
  }

  cancelEdit = field => {
    let { editing } = this.state
    this.setState({editing: {...editing, [field]: false}})
  }

  multiSave = (field1, field2) => {
    if (!this.validate()) return
    let { dispatch, community } = this.props
    let { editing, edited } = this.state
    this.setState({editing: {...editing, [field1]: false, [field2]: false}})
    dispatch(updateCommunitySettings({...community, ...edited}, {[field1]: community[field1], [field2]: community[field2]}))
  }

  multiEdit = (field1, field2) => {
    let { community } = this.props
    let { editing, edited } = this.state
    this.setState({
      editing: {...editing, [field1]: true, [field2]: true},
      edited: {...edited, [field1]: community[field1], [field2]: community[field2]}
    })
  }

  multiCancelEdit = (field1, field2) => {
    let { editing } = this.state
    this.setState({editing: {...editing, [field1]: false, [field2]: false}})
  }

  attachAvatarImage = () => {
    this.attachImage(true)
  }

  attachBannerImage = () => {
    this.attachImage(false)
  }

  avatarUploadSettings (community) {
    return {
      id: community.slug,
      subject: 'community-avatar',
      path: `community/${community.id}/avatar`,
      convert: {width: 160, height: 160, fit: 'crop', rotate: 'exif'}
    }
  }

  bannerUploadSettings (community) {
    return {
      id: community.slug,
      subject: 'community-banner',
      path: `community/${community.id}/banner`,
      convert: {width: 1600, format: 'jpg', fit: 'max', rotate: 'exif'}
    }
  }

  attachImage (avatar) {
    let { dispatch, community } = this.props
    if (avatar) {
      dispatch(uploadImage(this.avatarUploadSettings(community)))
    } else {
      dispatch(uploadImage(this.bannerUploadSettings(community)))
    }
  }

  update (field, value) {
    let { dispatch, community } = this.props
    var updatedCommunity = {...community, [field]: value}
    dispatch(updateCommunitySettings(updatedCommunity, {[field]: community[field]}))
  }

  updateSetting (setting, value) {
    let { community } = this.props
    let updatedSettings = {...community.settings, [setting]: value}
    this.update('settings', updatedSettings)
  }

  toggle (field) {
    this.update(field, !this.props.community[field])
  }

  toggleSetting (setting) {
    this.updateSetting(setting, !this.props.community.settings[setting])
  }

  toggleSection (section, open) {
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
    if (window.confirm(`Are you sure you wish to remove ${moderator.name}\'s moderator powers?`)) {
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
    switch (expand) {
      default:
        this.toggleSection('moderators', true)
        break
    }
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
    let origin = 'https://www.hylo.com'
    let join_url = origin + '/c/' + community.slug + '/join/' + community.beta_access_code

    return <div className='sections'>
      <div className='section-label' onClick={() => this.toggleSection('appearance')}>
        Appearance
        <i className={cx({'icon-down': expand.appearance, 'icon-right': !expand.appearance})}></i>
      </div>
      {expand.appearance && <div className='section appearance'>
        <div className='section-item'>
          <div className='half-column'>
            <label>Name</label>
            <p>{community.name}</p>
          </div>
          {!editing.name && <div className='half-column value'>
            <button type='button' onClick={() => this.edit('name')}>Change</button>
          </div>}
          {editing.name && <div className='half-column value'>
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
          </div>}
        </div>

        <div className='section-item description'>
          <div className='full-column'>
            <label>Core Intention / About</label>
          </div>
          {!editing.description && <div className='full-column'>
            <div className='description-value' dangerouslySetInnerHTML={{__html: markdown(community.description)}}></div>
            <button type='button' onClick={() => this.edit('description')}>Change</button>
          </div>}
          {editing.description && <div className='full-column'>
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
          </div>}
        </div>

        <div className='section-item icon'>
          <div className='half-column'>
            <label>Icon</label>
            <p className='summary'>This image appears next to your community's name. (Tip: Try a transparent PNG image.)</p>
          </div>
          <div className='half-column value'>
            <div className='community-logo' style={{backgroundImage: `url(${avatar_url})`}}/>
            <button type='button' onClick={this.attachAvatarImage}>Change</button>
          </div>
        </div>

        <div className='section-item'>
          <div className='full-column'>
            <label>Banner</label>
            <p className='summary'>This image appears at the top of your community page. (Suggested size: 1400x500 pixels.)</p>
            <div className='community-banner' style={{backgroundImage: `url(${banner_url})`}}></div>
          </div>
          <div className='full-column value'>
            <button type='button' onClick={this.attachBannerImage}>Change</button>
          </div>
        </div>

        <div className='section-item welcome-message'>
          <div className='full-column'>
            <label>Welcome message</label>
            <p className='summary'>This text is shown on the first screen that a new member sees.</p>
          </div>
          {!editing.welcome_message && <div className='full-column'>
            {community.welcome_message && <div className='leader'>
              <div className='medium-avatar' style={{backgroundImage: `url(${community.leader.avatar_url})`}}></div>
              <div className='name'>{community.leader.name}</div>
            </div>}
            <p>{community.welcome_message || '[Not set yet]'}</p>
            <div className='buttons'><button type='button' onClick={() => this.multiEdit('welcome_message', 'leader')}>Change</button></div>
          </div>}
          {editing.welcome_message && <div className='full-column edit'>
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
              <button type='button' onClick={() => this.multiCancelEdit('welcome_message', 'leader')}>Cancel</button>
              <button type='button' onClick={() => this.multiSave('welcome_message', 'leader')}>Save</button>
            </div>
          </div>}
        </div>

        <div className='section-item'>
          <div className='half-column'>
            <label>Location</label>
            <p>{community.location || 'You haven\'t specified a location yet.'}</p>
          </div>
          {!editing.location && <div className='half-column value'>
            <button type='button' onClick={() => this.edit('location')}>Change</button>
          </div>}
          {editing.location && <div className='half-column value'>
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
          </div>}
        </div>
      </div>}

      <div className='section-label' onClick={() => this.toggleSection('access')}>
        Access
        <i className={cx({'icon-down': expand.access, 'icon-right': !expand.access})}></i>
      </div>
      {expand.access && <div className='section appearance'>
        <div className='section-item'>
          <div className='half-column'>
            <label>Allow everyone to invite new members</label>
            <p className='summary'>If this is disabled, only moderators may send invitations to new members.</p>
          </div>
          <div className='half-column value'>
            <input type='checkbox' checked={community.settings.all_can_invite} onChange={() => this.toggleSetting('all_can_invite')}/>
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
            <p><a href={join_url}>{join_url}</a></p>
            <p className='summary'>You can copy this link for pasting in emails or embedding on your webpage
  to pre-populate the invite code for new members to easily join.</p>
          </div>
          {!editing.beta_access_code && <div className='half-column value'>
            <button type='button' onClick={() => this.edit('beta_access_code')}>Change</button>
          </div>}
          {editing.beta_access_code && <div className='half-column edit'>
            <form>
              <input name='beta_access_code' ref='beta_access_code' type='text' className='form-control' value={edited.beta_access_code} onChange={this.setBetaAccessCode} />
            </form>
            {errors.beta_access_code && errors.beta_access_code.empty && <p className='summary error'>Please fill in a code.</p>}
            {errors.beta_access_code && errors.beta_access_code.not_unique && <p className='summary error'>This code cannot be used; please choose another.</p>}
            <button type='button' onClick={() => this.cancelEdit('beta_access_code')}>Cancel</button>
            <button type='button' onClick={() => this.save('beta_access_code')}>Save</button>
          </div>}
        </div>
      </div>}

      <div className='section-label' onClick={() => this.toggleSection('moderators')}>
        Moderators
        <i className={cx({'icon-down': expand.moderators, 'icon-right': !expand.moderators})}></i>
      </div>
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

      <div className='section-label' onClick={() => this.toggleSection('email')}>
        Email
        <i className={cx({'icon-down': expand.email, 'icon-right': !expand.email})}></i>
      </div>
      {expand.email && <div className='section email'>
        <div className='section-item'>
          <div className='half-column'>
            <label>Send a weekly email inviting members to post?</label>
            <p className='summary'>If this is checked, each week members will receive an email that they can reply to with their offers, requests and intentions.</p>
          </div>
          <div className='half-column value'>
            <input type='checkbox' checked={community.settings.sends_email_prompts} onChange={() => this.toggleSetting('sends_email_prompts')}/>
          </div>
        </div>
      </div>}

    </div>
  }
}
