import React from 'react'
import { connect } from 'react-redux'
const { object, bool, func } = React.PropTypes
import { toPairs, get, some } from 'lodash/fp'
import { includes } from 'lodash'
import ModalOnlyPage from '../components/ModalOnlyPage'
import { ModalInput, ModalSelect } from '../components/ModalRow'
import Modal from '../components/Modal'
import { categories } from './community/CommunityEditor'
import { uploadImage } from '../actions/uploadImage'
import {
  CREATE_COMMUNITY,
  UPLOAD_IMAGE,
  createCommunity,
  navigate,
  resetCommunityValidation,
  updateCommunityEditor,
  validateCommunityAttribute
} from '../actions'
import {
  avatarUploadSettings,
  bannerUploadSettings,
  defaultAvatar,
  defaultBanner,
  getCurrentCommunity
} from '../models/community'
import { scrollToBottom } from '../util/scrolling'
import { ADDED_COMMUNITY, trackEvent } from '../util/analytics'
import { saveCurrentCommunityId } from '../actions/util'

const merkabaUrl = 'https://www.hylo.com/img/hylo-merkaba-300x300.png'

export const CreateCommunity = ({ children }) => <div className>
  {children}
</div>

@connect(state => ({community: getCurrentCommunity(state)}))
export class CreateCommunityContainer extends React.Component {
  static propTypes = {
    community: object,
    children: object
  }

  render () {
    const { children, community } = this.props

    const logoUrl = community ? community.avatar_url : merkabaUrl

    return <ModalOnlyPage>
      <div className='modal-topper'>
        <div className='medium-avatar' style={{backgroundImage: `url(${logoUrl})`}}/>
        <h2>Create Community</h2>
      </div>}
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
export class CreateCommunityOne extends React.Component {
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
          saveCurrentCommunityId(dispatch, payload.id, currentUser.id)
          dispatch(navigate(`/create/two`))
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
        <ModalInput label='Name' ref='name' onChange={this.set('name')}/>
        {errors.nameBlank && <p className='help error'>Please fill in this field.</p>}
        {errors.nameUsed && <p className='help error'>This name is already in use.</p>}
        <ModalInput label='URL' ref='url' prefix='https://hylo.com/c/' onChange={this.set('slug')}/>
        {errors.slugBlank && <p className='help error'>Please fill in this field.</p>}
        {errors.slugInvalid && <p className='help error'>Use lowercase letters, numbers, and hyphens only.</p>}
        {errors.slugUsed && <p className='help error'>This URL is already in use.</p>}
        <ModalInput label='Description' ref='description' type='textarea' onChange={this.set('description')}/>
        {errors.descriptionBlank && <p className='help error'>Please fill in this field.</p>}
        <ModalInput label='Invitation Code' ref='beta_access_code' onChange={this.set('beta_access_code')}/>
        {errors.codeInvalid && <p className='help error'>The code may not contain the slash ("/") character.</p>}
        {errors.codeBlank && <p className='help error'>Please fill in a code.</p>}
        {errors.codeUsed && <p className='help error'>This code cannot be used; please choose another.</p>}
        <div className='toggle-advanced'>
          <a onClick={() => this.setState({expanded: !expanded})}>More Options</a>
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
          <button onClick={() => this.attachImage('avatar')}>Upload</button>
        </div>}
        <div className='footer'>
          <input ref='submit' type='submit' value='Create' onClick={this.submit}/>
        </div>
    </Modal>
  }
}

export class CreateCommunityTwo extends React.Component {

  render () {
    const error = false

    return <Modal title='Invite Members.'
      standalone>
      <div>
        <label>Import CSV File</label>
        <button>Browse</button>
      </div>
    </Modal>
  }
}

export class CreateCommunityThree extends React.Component {

  render () {
    const error = false

    return <Modal title='Create your community.'
      subtitle="Let's get started unlocking the creative potential of your community with Hylo"
      standalone>
      <form onSubmit={this.submit}>
        {error && <div className='alert alert-danger'>{error}</div>}
        <ModalInput label='Name' ref='name'/>
        <ModalInput label='URL' ref='url'/>
        <div className='footer'>
          <input ref='submit' type='submit' value='Create'/>
        </div>
      </form>
    </Modal>
  }
}
