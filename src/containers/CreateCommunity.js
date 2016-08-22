import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
const { object, bool, func } = React.PropTypes
import { toPairs, get, some, isEmpty, filter } from 'lodash/fp'
import { includes } from 'lodash'
import validator from 'validator'
import ModalOnlyPage from '../components/ModalOnlyPage'
import { ModalInput, ModalSelect } from '../components/ModalRow'
import Modal from '../components/Modal'
import A from '../components/A'
import Icon from '../components/Icon'
import { categories } from './community/CommunityEditor'
import { uploadImage } from '../actions/uploadImage'
import {
  CREATE_COMMUNITY,
  UPLOAD_IMAGE,
  createCommunity,
  navigate,
  resetCommunityValidation,
  updateCommunityEditor,
  validateCommunityAttribute,
  updateInvitationEditor,
  sendCommunityInvitation,
  fetchCommunity
} from '../actions'
import {
  avatarUploadSettings,
  bannerUploadSettings,
  defaultAvatar,
  defaultBanner,
  getCurrentCommunity,
  getCheckList
} from '../models/community'
import { canInvite } from '../models/currentUser'
import { scrollToBottom } from '../util/scrolling'
import { parseEmailString, emailsFromCSVFile } from '../util/text'
import { ADDED_COMMUNITY, INVITED_COMMUNITY_MEMBERS, trackEvent } from '../util/analytics'
import { saveCurrentCommunityId } from '../actions/util'
import { defaultSubject, defaultMessage } from './community/CommunityInvitations'

const merkabaUrl = 'https://www.hylo.com/img/hylo-merkaba-300x300.png'

@connect(state => ({community: getCurrentCommunity(state)}))
export class CreateCommunityContainer extends React.Component {
  static propTypes = {
    community: object,
    children: object
  }

  render () {
    const { children, community } = this.props

    const logoUrl = community ? community.avatar_url : merkabaUrl

    return <ModalOnlyPage className='create-community'>
      <div className='modal-topper'>
        <div className='medium-avatar' style={{backgroundImage: `url(${logoUrl})`}}/>
        <h2>Create Community</h2>
      </div>
      {children}
    </ModalOnlyPage>
  }
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
  errors.codeUsed = get('beta_access_code.unique', communityValidation) === false

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
      case 'beta_access_code':
        this.setError({codeBlank: !value})

        if (!value) {
          this.resetValidation('beta_access_code')
        } else if (includes(value, '/')) {
          this.setError({codeInvalid: true})
        } else {
          return this.checkUnique('beta_access_code', value)
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
      ['name', 'description', 'slug', 'beta_access_code', 'category']
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
          dispatch(navigate(`/create/invite`))
        }
      })
    })
  }

  render () {
    const { community, errors } = this.props

    const { expanded } = this.state

    return <Modal title='Create your community.'
      className='create-community-one'
      subtitle="Let's get started unlocking the creative potential of your community with Hylo"
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
        <ModalInput label='Invitation Code' ref='beta_access_code' onChange={this.set('beta_access_code')}
          errors={
            <div className='errors'>
              {errors.codeInvalid && <p className='help error'>The code may not contain the slash ("/") character.</p>}
              {errors.codeBlank && <p className='help error'>Please fill in a code.</p>}
              {errors.codeUsed && <p className='help error'>This code cannot be used; please choose another.</p>}
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
  }
}

@connect(state => ({
  community: getCurrentCommunity(state),
  currentUser: get('people.current', state),
  invitationEditor: get('invitationEditor', state)
}))
export class CreateCommunityInvite extends React.Component {

  static propTypes = {
    community: object,
    currentUser: object,
    invitationEditor: object,
    dispatch: func
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
      dispatch(updateInvitationEditor('subject', defaultSubject(community.name)))
    }
    if (message === undefined) {
      dispatch(updateInvitationEditor('message', defaultMessage(community.name)))
    }
  }

  render () {
    const { expanded } = this.state
    const { community, currentUser, dispatch, invitationEditor } = this.props

    if (!canInvite(currentUser, community)) {
      return <div>
        You don&#39;t have permission to view this page.
      </div>
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
        dispatch(navigate(`/c/${community.slug}?invite-success`))
      })
    }

    return <Modal title={`Invite Members to ${community.name}.`}
      className='create-community-two'
      standalone>
      <div className='modal-input csv-upload'>
        <label className='normal-label'>Import CSV File</label>
        <div className='help-text'>The file should have a header row named "email" for the email column. Or it can be a file in which each line is a single email address.</div>
        <label className='custom-file-upload'>
          <input type='file' onChange={() => this.processCSV()} ref='fileInput'/>
          Browse
        </label>
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
        <a className='button' onClick={submit}>Invite</a>
        <A to={`/c/${community.slug}`} className='skip'>Skip</A>
      </div>
    </Modal>
  }
}

@prefetch(({ dispatch, store }) => {
  dispatch(fetchCommunity(get('slug', getCurrentCommunity(store.getState()))))
})
@connect(state => ({community: getCurrentCommunity(state)}))
export class CreateCommunityThree extends React.Component {

  static propTypes = {
    dispatch: func,
    community: object
  }

  render () {
    const { dispatch, community } = this.props

    const checkList = getCheckList(community)

    const percent = (filter(ci => ci.done, checkList).length / checkList.length) * 100

    return <Modal title='Getting Started.'
      className='create-community-three'
      standalone>
      <PercentBar percent={percent}/>
      <div className='subtitle'>
        To create a successful community with Hylo, we suggest completing the following:
      </div>
      {checkList.map(({ title, link, done, id }) =>
        <CheckItem title={title} link={link} done={done} key={id} />)}
      <button onClick={() => dispatch(navigate(`/c/${community.slug}`))}>Done</button>
      <A to='/create/three' className='skip'>Do this later</A>
    </Modal>
  }
}

const CheckItem = ({ title, link, done }) => {
  return <div className='check-item form-sections'>
    <input type='checkbox' checked={done} />
    {title}
    <A to={link}>></A>
  </div>
}

const PercentBar = ({ percent }) => {
  return <div className='percent-bar'>
    {percent}% completed
  </div>
}
