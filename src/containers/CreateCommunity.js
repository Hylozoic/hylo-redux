import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
const { array, bool, func, object } = React.PropTypes
import { toPairs, get, some, isEmpty } from 'lodash/fp'
import validator from 'validator'
import ModalOnlyPage from '../components/ModalOnlyPage'
import AccessErrorMessage from '../components/AccessErrorMessage'
import { ModalInput, ModalSelect } from '../components/ModalRow'
import Modal from '../components/Modal'
import A from '../components/A'
import Icon from '../components/Icon'
import { uploadImage } from '../actions/uploadImage'
import {
  CREATE_COMMUNITY,
  UPLOAD_IMAGE,
  fetchInvitations,
  navigate,
  updateInvitationEditor,
  sendCommunityInvitation
} from '../actions'
import {
  createCommunity,
  resetCommunityValidation,
  updateCommunityEditor,
  validateCommunityAttribute
} from '../actions/communities'
import {
  avatarUploadSettings,
  bannerUploadSettings,
  categories,
  defaultAvatar,
  defaultBanner,
  getCurrentCommunity
} from '../models/community'
import { canInvite } from '../models/currentUser'
import { scrollToBottom } from '../util/scrolling'
import { parseEmailString, emailsFromCSVFile } from '../util/text'
import { ADDED_COMMUNITY, INVITED_COMMUNITY_MEMBERS, trackEvent } from '../util/analytics'
import { saveCurrentCommunityId } from '../actions/util'
import { defaultInvitationSubject, defaultInvitationMessage } from '../models/community'
import InvitationList from './community/InvitationList'

const merkabaUrl = 'https://www.hylo.com/img/hylo-merkaba-300x300.png'

export const Topper = ({ community }) => {
  const { name, avatar_url } = community || {}
  const logoUrl = avatar_url || merkabaUrl

  return <div className='modal-topper'>
    <div className='medium-avatar' style={{backgroundImage: `url(${logoUrl})`}}/>
    <h2>{name || 'Your New Community'}</h2>
  </div>
}

@connect(({ communityEditor, communityValidation, pending, people }) => {
  const validating = some(id => id, communityValidation.pending)
  let { community, errors } = communityEditor
  const saving = pending[CREATE_COMMUNITY]
  const uploadingImage = !!pending[UPLOAD_IMAGE]
  const currentUser = get('current', people)

  if (!errors) errors = {}
  errors.nameUsed = get('name.unique', communityValidation) === false
  errors.slugUsed = get('slug.unique', communityValidation) === false

  if (!community) community = {}
  if (!community.avatar_url) community.avatar_url = defaultAvatar
  if (!community.banner_url) community.banner_url = defaultBanner

  return {community, errors, validating, saving, uploadingImage, currentUser}
})
export class CreateCommunity extends React.Component {
  static propTypes = {
    saving: bool,
    uploadingImage: bool,
    validating: bool,
    errors: object,
    dispatch: func,
    community: object,
    currentUser: object
  }

  constructor (props) {
    super(props)
    this.state = {
      expanded: false
    }
  }

  setValue = (key, value) =>
    this.props.dispatch(updateCommunityEditor('community', {[key]: value}))

  setError = obj =>
    this.props.dispatch(updateCommunityEditor('errors', obj))

  resetValidation = key =>
    this.props.dispatch(resetCommunityValidation(key))

  checkUnique = (key, value) =>
    this.props.dispatch(validateCommunityAttribute(key, value, 'unique'))

  set = key => event => {
    let { value } = event.target
    this.setValue(key, value)
    this.validate(key, value)
  }

  validate (key, value) {
    switch (key) {
      case 'name':
        this.setError({nameBlank: !value})

        if (!value) {
          this.resetValidation('name')
        } else {
          return this.checkUnique('name', value)
        }
        break
      case 'description':
        this.setError({descriptionBlank: !value})
        break
      case 'slug':
        let error = {slugBlank: false, slugInvalid: false}

        if (!value) {
          error.slugBlank = true
        } else if (!value.match(/^[a-z0-9-+]+$/)) {
          error.slugInvalid = true
        }

        this.setError(error)

        if (some(error)) {
          this.resetValidation('slug')
        } else {
          return this.checkUnique('slug', value)
        }
        break
    }
  }

  attachImage (type) {
    let { dispatch } = this.props
    let community = {id: 'new', slug: 'new'}
    switch (type) {
      case 'avatar':
        dispatch(uploadImage(avatarUploadSettings(community)))
        break
      case 'banner':
        dispatch(uploadImage(bannerUploadSettings(community)))
    }
    return false
  }

  validateAll () {
    let { community } = this.props
    return Promise.all(
      ['name', 'description', 'slug', 'category']
      .map(key => this.validate(key, community[key]))
    )
  }

  submit = () => {
    let { validating, dispatch, community, currentUser } = this.props
    if (validating) return

    this.validateAll().then(() => {
      if (some(id => id, this.props.errors)) return scrollToBottom()

      dispatch(createCommunity(community))
      .then(({ payload }) => {
        if (some(id => id, this.props.errors)) {
          return scrollToBottom()
        } else {
          trackEvent(ADDED_COMMUNITY, {community})
          saveCurrentCommunityId(dispatch, payload.community_id, currentUser.id)
          dispatch(navigate(`/invite`))
        }
      })
    })
  }

  render () {
    const { community, errors } = this.props

    const { expanded } = this.state

    return <ModalOnlyPage className='create-community'>
      <Topper community={community}/>
      <Modal title='Create your community.'
        id='new-community-form'
        subtitle="Let's get started unlocking the creative potential of your community with Hylo."
        standalone>
        <ModalInput label='Name' ref='name' onChange={this.set('name')}
          errors={<div className='errors'>
            {errors.nameBlank && <p className='help error'>Please fill in this field.</p>}
            {errors.nameUsed && <p className='help error'>This name is already in use.</p>}
          </div>}/>
        <ModalInput label='URL' ref='url' prefix='https://hylo.com/c/' onChange={this.set('slug')}
          errors={
            <div className='errors'>
              {errors.slugBlank && <p className='help error'>Please fill in this field.</p>}
              {errors.slugInvalid && <p className='help error'>Use lowercase letters, numbers, and hyphens only.</p>}
              {errors.slugUsed && <p className='help error'>This URL is already in use.</p>}
            </div>}/>
        <ModalInput label='Description' ref='description' type='textarea' onChange={this.set('description')}
          errors={
            <div className='errors'>
              {errors.descriptionBlank && <p className='help error'>Please fill in this field.</p>}
            </div>}/>
        <div className='toggle-section'>
          <a onClick={() => this.setState({expanded: !expanded})}>
            More Options
            <Icon name={expanded ? 'Chevron-Up2' : 'Chevron-Down2'} />
          </a>
        </div>
        {expanded && <ModalSelect label='Community Type' onChange={this.set('category')}>
          <option value=''>Pick one:</option>
          {toPairs(categories).map(([value, label]) => <option key={value} value={value}>
            {label}
          </option>)}
        </ModalSelect>}
        {expanded && <ModalInput label='Location' onChange={this.set('location')}/>}
        {expanded && <div className='modal-input'>
          <label>Logo</label>
          <div className='small-logo' style={{backgroundImage: `url(${community.avatar_url})`}}></div>
          <a className='button upload' onClick={() => this.attachImage('avatar')}>Upload</a>
        </div>}
        <div className='footer'>
          <a className='button' ref='submit' onClick={this.submit}>Create</a>
        </div>
      </Modal>
      <div className='after-modal'>
        <A to='/c/join'>Trying to join a community?</A>
      </div>
  </ModalOnlyPage>
  }
}

@prefetch(({ params: { id }, dispatch }) =>
  id && dispatch(fetchInvitations(id)))
@connect((state, { params: { id } }) => ({
  community: id ? state.communities[id] : getCurrentCommunity(state),
  currentUser: get('people.current', state),
  invitationEditor: get('invitationEditor', state),
  invitations: id ? state.invitations[id] : null
}))
export class CreateCommunityInvite extends React.Component {
  static propTypes = {
    community: object,
    currentUser: object,
    invitationEditor: object,
    dispatch: func,
    invitations: array
  }

  constructor (props) {
    super(props)
    this.state = {
      emails: '',
      expanded: false
    }
  }

  processCSV () {
    const { dispatch } = this.props

    const appendComma = string => {
      if (isEmpty(string) || string.trim().slice(-1) === ',') return string
      return string + ','
    }

    emailsFromCSVFile(this.refs.fileInput.files[0])
    .then(emails => {
      const textarea = this.refs.emails
      dispatch(updateInvitationEditor('recipients',
        appendComma(textarea.getValue()) + ' ' + emails.join(', ')))
    })
  }

  componentDidMount () {
    const { dispatch, community, invitationEditor } = this.props
    const { subject, message } = invitationEditor

    if (subject === undefined) {
      dispatch(updateInvitationEditor('subject', defaultInvitationSubject(community.name)))
    }
    if (message === undefined) {
      dispatch(updateInvitationEditor('message', defaultInvitationMessage(community.name)))
    }
  }

  render () {
    const { expanded } = this.state
    const {
      community, currentUser, dispatch, invitationEditor, invitations
    } = this.props

    if (!canInvite(currentUser, community)) {
      return <AccessErrorMessage error={{status: 403}}/>
    }

    let { subject, message, recipients, moderator, error } = invitationEditor

    let setError = text => dispatch(updateInvitationEditor('error', text))

    let update = (field, toggle) => event => {
      let { value } = event.target
      if (toggle) value = !invitationEditor[field]
      dispatch(updateInvitationEditor(field, value))
    }

    let submit = () => {
      dispatch(updateInvitationEditor('results', null))
      setError(null)

      if (!subject) return setError('The subject may not be blank.')
      if (!message) return setError('The message may not be blank.')

      let emails = parseEmailString(recipients)
      if (isEmpty(emails)) return setError('Enter at least one email address.')

      let badEmails = emails.filter(email => !validator.isEmail(email))
      if (some(id => id, badEmails)) return setError(`These emails are invalid: ${badEmails.join(', ')}`)

      dispatch(sendCommunityInvitation(community.id, {subject, message, emails, moderator}))
      .then(({ error }) => {
        if (error) return
        trackEvent(INVITED_COMMUNITY_MEMBERS, {community})
        dispatch(navigate(`/c/${community.slug}/checklist`))
      })
    }

    return <ModalOnlyPage className='create-community'>
      <Topper community={community}/>
      <Modal title='Invite people to join you.'
      id='community-invite-prompt'
      standalone>
        <div className='modal-input csv-upload'>
          <label className='custom-file-upload'>
            <input type='file' onChange={() => this.processCSV()} ref='fileInput'/>
            Browse
          </label>
          <label className='normal-label'>Import CSV File</label>
          <p className='help-text'>The file should have a header row named "email" for the email column. Or it can be a file in which each line is a single email address.</p>
        </div>
        <ModalInput
          className='emails'
          label='Enter Emails'
          ref='emails'
          type='textarea'
          value={recipients}
          onChange={update('recipients')}
          placeholder='Enter email addresses, separated by commas or line breaks'/>
          <div className='toggle-section'>
            <a onClick={() => this.setState({expanded: !expanded})}>
              Customize Message
              <Icon name={expanded ? 'Chevron-Up2' : 'Chevron-Down2'} />
            </a>
          </div>

        {expanded && <ModalInput
          label='Subject'
          ref='subject'
          value={subject}
          onChange={update('subject')}/>}
        {expanded && <ModalInput
          label='Message'
          ref='message'
          type='textarea'
          value={message}
          onChange={update('message')}/>}
        {error && <div className='alert alert-danger'>{error}</div>}
        <div className='footer'>
          <a className='button ok' onClick={submit}>Invite</a>
          <A to={`/c/${community.slug}`} className='skip'>Skip</A>
        </div>
      </Modal>

      {!isEmpty(invitations) &&
        <Modal title='Sent invitations' standalone id='community-invitations'>
          <InvitationList id={community.slug}/>
        </Modal>}
    </ModalOnlyPage>
  }
}
