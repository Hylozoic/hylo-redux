import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
const { array, bool, func, object } = React.PropTypes
import { toPairs, get, some, isEmpty } from 'lodash/fp'
import ModalOnlyPage from '../components/ModalOnlyPage'
import { ModalInput, ModalSelect } from '../components/ModalRow'
import Modal from '../components/Modal'
import A from '../components/A'
import Icon from '../components/Icon'
import InviteModal from '../containers/InviteModal'
import { uploadImage } from '../actions/uploadImage'
import {
  CREATE_COMMUNITY,
  UPLOAD_IMAGE,
  fetchInvitations,
  navigate
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
import { scrollToBottom } from '../util/scrolling'
import { ADDED_COMMUNITY, trackEvent } from '../util/analytics'
import { saveCurrentCommunityId } from '../actions/util'
import InvitationList from './community/InvitationList'
import { checklistUrl } from '../routes'

const merkabaUrl = 'https://www.hylo.com/img/hylo-merkaba-300x300.png'

export const Topper = ({ community, showJoin }) => {
  const { name, avatar_url } = community || {}
  const logoUrl = avatar_url || merkabaUrl

  return <div className='modal-topper'>
    <div className='medium-avatar' style={{backgroundImage: `url(${logoUrl})`}}/>
    <h2>{name || 'Your New Community'}</h2>
    {showJoin && <div className='before-modal'>
      <A to='/c/join'>Trying to join a community?</A>
    </div>}
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
    let { validating, dispatch, community } = this.props
    if (validating) return

    this.validateAll().then(() => {
      if (some(id => id, this.props.errors)) return scrollToBottom()

      dispatch(createCommunity(community))
      .then(({ payload }) => {
        if (some(id => id, this.props.errors)) {
          return scrollToBottom()
        } else {
          trackEvent(ADDED_COMMUNITY, {community})
          saveCurrentCommunityId(dispatch, payload.community_id, true)
          dispatch(navigate(`/invite`))
        }
      })
    })
  }

  render () {
    const { community, errors, uploadingImage } = this.props

    const { expanded } = this.state

    return <ModalOnlyPage className='create-community'>
      <Topper community={community} showJoin={true}/>
      <Modal title='Create your community.'
        id='new-community-form'
        subtitle="Let's get started unlocking the creative potential of your community with Hylo."
        standalone>
        <ModalInput label='Community Name' ref='name' onChange={this.set('name')}
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
          <ModalInput label='About your community' ref='description' type='textarea' onChange={this.set('description')}
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
          <a className='button upload' onClick={() => this.attachImage('avatar')}>
            {uploadingImage ? 'Saving...' : 'Upload'}
          </a>
        </div>}
        <div className='footer'>
          <a className='button' ref='submit' onClick={this.submit}>Create</a>
        </div>
      </Modal>
  </ModalOnlyPage>
  }
}

@prefetch(({ params: { id }, dispatch }) =>
  id && dispatch(fetchInvitations(id)))
@connect((state, { params: { id } }) => ({
  community: id ? state.communities[id] : getCurrentCommunity(state),
  invitations: id ? state.invitations[id] : null
}))
export class CreateCommunityInvite extends React.Component {
  static propTypes = {
    community: object,
    dispatch: func,
    invitations: array
  }

  render () {
    const { community, invitations, dispatch } = this.props

    const onClose = () => dispatch(navigate(checklistUrl(community)))

    return <ModalOnlyPage className='create-community'>
      <Topper community={community}/>
      <InviteModal onClose={onClose} standalone/>

      {!isEmpty(invitations) &&
        <Modal title='Sent invitations' standalone id='community-invitations'>
          <InvitationList id={community.slug}/>
        </Modal>}
    </ModalOnlyPage>
  }
}
