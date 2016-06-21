import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import cx from 'classnames'
const { object, func } = React.PropTypes
import { find, get, reduce, isEmpty } from 'lodash'
import { markdown, sanitize } from '../../util/text'
import {
  updateCommunitySettings,
  fetchCommunitySettings,
  fetchCommunityModerators,
  addCommunityModerator,
  removeCommunityModerator,
  resetCommunityValidation,
  validateCommunityAttribute,
  navigate
} from '../../actions'
import { avatarUploadSettings, bannerUploadSettings } from '../../models/community'
import A from '../../components/A'
import { uploadImage } from '../../actions/uploadImage'
import PersonChooser from '../../components/PersonChooser'
import { reversibleUpdate } from '../../util/forms'
import { makeUrl } from '../../util/navigation'

@prefetch(({dispatch, params: {id}}) =>
  Promise.all([
    dispatch(fetchCommunitySettings(id)),
    dispatch(fetchCommunityModerators(id))
  ])
)
@connect((state, { params }) => ({
  community: state.communities[params.id],
  validation: state.communityValidation,
  currentUser: get(state, 'people.current')
}))
export default class CommunitySettings extends React.Component {

  constructor (props) {
    super(props)
    this.state = {editing: {}, edited: {}, errors: {}, expand: {}}
  }

  static propTypes = {
    community: object,
    dispatch: func,
    location: object,
    currentUser: object,
    validation: object
  }

  setEditState = (field, value, errors) =>
    this.setState({
      edited: {...this.state.edited, [field]: value},
      errors: {...this.state.errors, [field]: errors}
    })

  setField = (name, required) => event =>
    this.setEditState(name, event.target.value, required && !event.target.value)

  setBetaAccessCode = event => {
    let { dispatch, community } = this.props
    let code = event.target.value

    if (code && code !== community.beta_access_code) {
      dispatch(validateCommunityAttribute('beta_access_code', code, 'unique'))
    } else {
      dispatch(resetCommunityValidation('beta_access_code'))
    }

    let errors = !code ? {empty: true} : {}
    return this.setEditState('beta_access_code', code, errors)
  }

  setSlug = event => {
    let { dispatch, community } = this.props
    let slug = event.target.value

    if (slug && slug !== community.slug) {
      dispatch(validateCommunityAttribute('slug', slug, 'unique'))
    } else {
      dispatch(resetCommunityValidation('slug'))
    }

    let errors = !slug ? {empty: true} : {}
    return this.setEditState('slug', slug, errors)
  }

  validate () {
    let { errors } = this.state

    if (errors.name) {
      window.alert('Please provide a community name.')
      this.refs.name.focus()
      return
    }

    if (errors.slug) {
      if (errors.slug.not_unique) {
        window.alert('This slug cannot be used; please choose another.')
        this.refs.slug.focus()
        return
      }
      if (errors.slug.empty) {
        window.alert('Please fill in a slug.')
        this.refs.slug.focus()
        return
      }
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
    let { slug } = community
    let newEditing = reduce(args, (m, field) => { m[field] = false; return m }, {})
    let oldSettings = reduce(args, (m, field) => { m[field] = community[field]; return m }, {})
    this.setState({editing: {...editing, ...newEditing}})
    dispatch(updateCommunitySettings(community.id, {slug, ...edited}, oldSettings))
    .then(({ error }) => {
      if (error || !edited.slug) return
      dispatch(navigate(makeUrl(`/c/${edited.slug}/settings`, {expand: 'appearance'})))
    })
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
    ;(() => {
      switch (type) {
        case 'avatar_url':
          return dispatch(uploadImage(avatarUploadSettings(community)))
        case 'banner_url':
          return dispatch(uploadImage(bannerUploadSettings(community)))
      }
    })()
    .then(action => {
      let { error, payload } = action
      if (error) return
      this.update(type, payload)
    })
  }

  update (path, value) {
    let { dispatch, community } = this.props
    return dispatch(reversibleUpdate(updateCommunitySettings, community, path, value, 'community'))
  }

  toggle (path) {
    this.update(path, !get(this.props.community, path))
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

  delete = () => {
    let { community, dispatch } = this.props
    if (window.confirm(`Are you sure you wish to delete ${community.name}? This cannot be undone.`)) {
      this.update('active', false)
      .then(({ error }) => {
        if (error) return
        dispatch(navigate('/'))
      })
    }
  }

  componentDidMount () {
    let { location: { query } } = this.props
    let { expand } = query || {}
    if (expand) this.toggleSection(expand, true)
  }

  render () {
    let { community } = this.props
    let { avatar_url, banner_url } = community
    let { editing, edited, errors, expand } = this.state
    let labelProps = {expand, toggle: this.toggleSection}
    let joinUrl, codeNotUnique, slugNotUnique
    let { is_admin } = this.props.currentUser

    if (expand.appearance) {
      slugNotUnique = get(this.props.validation, 'slug.unique') === false
    }

    if (expand.access) {
      let origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.hylo.com'
      joinUrl = `${origin}/c/${community.slug}/join/${community.beta_access_code}`

      codeNotUnique = get(this.props.validation, 'beta_access_code.unique') === false
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
            ? <div className='half-column right-align'>
                <form name='nameForm'>
                  <div className={cx('form-group', {'has-error': errors.name})}>
                    <input type='text' ref='name' className='name form-control'
                      value={edited.name}
                      onChange={this.setField('name', true)}/>
                    </div>
                </form>
                <div className='buttons'>
                  <button type='button' onClick={() => this.cancelEdit('name')}>Cancel</button>
                  <button type='button' className='btn-primary' onClick={() => this.save('name')}>Save</button>
                </div>
              </div>
            : <div className='half-column right-align'>
                <button type='button' onClick={() => this.edit('name')}>Change</button>
              </div>}
        </div>

        {is_admin && <div className='section-item'>
          <div className='half-column'>
            <label>Slug</label>
            <p>{community.slug}</p>
          </div>
          {editing.slug
            ? <div className='half-column right-align'>
                <form name='slugForm'>
                  <div className={cx('form-group', {'has-error': !isEmpty(errors.slug)})}>
                    <input type='text' ref='slug' className='slug form-control'
                      value={edited.slug}
                      onChange={this.setSlug}/>
                    </div>
                </form>
                <p className='meta'>Warning: any links that refer to the old slug will no longer work.</p>
                {!!get(errors, 'slug.empty') && <p className='help error'>Please fill in a slug.</p>}
                {slugNotUnique && <p className='help error'>This code cannot be used; please choose another.</p>}
                <div className='buttons'>
                  <button type='button' onClick={() => this.cancelEdit('slug')}>Cancel</button>
                  <button type='button' className='btn-primary' onClick={() => this.save('slug')}>Save</button>
                </div>
              </div>
            : <div className='half-column right-align'>
                <button type='button' onClick={() => this.edit('slug')}>Change</button>
              </div>}
        </div>}

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
                      onChange={this.setField('description')}/>
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
          <div className='half-column right-align'>
            <div className='medium-logo' style={{backgroundImage: `url(${avatar_url})`}}/>
            <button type='button' onClick={() => this.attachImage('avatar_url')}>Change</button>
          </div>
        </div>

        <div className='section-item'>
          <div className='full-column'>
            <label>Banner</label>
            <p className='summary'>This image appears at the top of your community page. (Suggested size: 1400x500 pixels.)</p>
            <div className='banner' style={{backgroundImage: `url(${banner_url})`}}></div>
          </div>
          <div className='full-column right-align'>
            <button type='button' onClick={() => this.attachImage('banner_url')}>Change</button>
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
                  onChange={this.setField('welcome_message')}
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
                <p dangerouslySetInnerHTML={{__html: markdown(sanitize(community.welcome_message) || '[Not set yet]')}}></p>
                <div className='buttons'><button type='button' onClick={() => this.edit('welcome_message', 'leader')}>Change</button></div>
              </div>}
        </div>

        <div className='section-item'>
          <div className='half-column'>
            <label>Location</label>
            <p>{community.location || 'You haven\'t specified a location yet.'}</p>
          </div>
          {editing.location
            ? <div className='half-column right-align'>
                <form name='nameForm'>
                  <div className={cx('form-group', {'has-error': errors.location})}>
                    <input type='text' ref='location' className='location form-control'
                      value={edited.location}
                      onChange={this.setField('location')}/>
                    </div>
                </form>
                <div className='buttons'>
                  <button type='button' onClick={() => this.cancelEdit('location')}>Cancel</button>
                  <button type='button' className='btn-primary' onClick={() => this.save('location')}>Save</button>
                </div>
              </div>
            : <div className='half-column right-align'>
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
          <div className='half-column right-align'>
            <input type='checkbox' checked={community.settings.all_can_invite} onChange={() => this.toggle('settings.all_can_invite')}/>
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
                {!!get(errors, 'beta_access_code.empty') && <p className='help error'>Please fill in a code.</p>}
                {codeNotUnique && <p className='help error'>This code cannot be used; please choose another.</p>}
                <button type='button' onClick={() => this.cancelEdit('beta_access_code')}>Cancel</button>
                <button type='button' onClick={() => this.save('beta_access_code')}>Save</button>
              </div>
            : <div className='half-column right-align'>
                <button type='button' onClick={() => this.edit('beta_access_code')}>Change</button>
              </div>}
        </div>
      </div>}

      <SectionLabel name='moderators' {...labelProps}>Moderation</SectionLabel>
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
        <div className='section-item'>
          <div className='full-column'>
            <A className='button' to={`/c/${community.slug}/settings/tags`}>
              Moderate topics
            </A>
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
          <div className='half-column right-align'>
            <input type='checkbox' checked={community.settings.sends_email_prompts} onChange={() => this.toggle('settings.sends_email_prompts')}/>
          </div>
        </div>
      </div>}

      <SectionLabel name='delete' {...labelProps}>Delete</SectionLabel>
      {expand.delete && <div className='section delete'>
        <div className='section-item'>
          <div className='half-column'>
            <label>Delete this community</label>
            <p className='summary'>This will delete the community, preventing users from joining, browsing or posting in this community. Existing posts will still be viewable on the "All Posts" page.</p>
          </div>
          <div className='half-column right-align'>
            <button type='button' onClick={this.delete}>Delete</button>
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
