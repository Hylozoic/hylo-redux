import React from 'react'
import { connect } from 'react-redux'
import { any, get, omit } from 'lodash'
import {
  CREATE_COMMUNITY,
  createNetwork,
  navigate,
  resetCommunityValidation,
  updateCommunityEditor,
  validateCommunityAttribute
} from '../../actions'
import { uploadImage } from '../../actions/uploadImage'
import { avatarUploadSettings, bannerUploadSettings } from '../../models/community'
import { scrollToBottom } from '../../util/scrolling'
const { bool, func, object } = React.PropTypes

const defaultBanner = 'https://d3ngex8q79bk55.cloudfront.net/misc/default_community_banner.jpg'
const defaultAvatar = 'https://d3ngex8q79bk55.cloudfront.net/misc/default_community_avatar.png'

@connect(({communityEditor, communityValidation, pending}) => {
  let validating = any(communityValidation.pending)
  let { community, errors } = communityEditor
  let saving = pending[CREATE_COMMUNITY]

  if (!errors) errors = {}
  errors.nameUsed = get(communityValidation, 'name.unique') === false
  errors.slugUsed = get(communityValidation, 'slug.unique') === false
  errors.codeUsed = get(communityValidation, 'beta_access_code.unique') === false

  if (!community) community = {}
  if (!community.avatar_url) community.avatar_url = defaultAvatar
  if (!community.banner_url) community.banner_url = defaultBanner

  return {community, errors, validating, saving}
})
export default class CommunityEditor extends React.Component {
  static propTypes = {
    saving: bool,
    validating: bool,
    errors: object,
    dispatch: func,
    community: object
  }

  setValue = (key, value) =>
    this.props.dispatch(updateCommunityEditor('community', {[key]: value}))

  setError = obj =>
    this.props.dispatch(updateCommunityEditor('errors', obj))

  resetValidation = key =>
    this.props.dispatch(resetCommunityValidation(key))

  checkUnique = (key, value) =>
    this.props.dispatch(validateCommunityAttribute(key, value, 'unique'))

  setName = event => {
    let { value } = event.target
    this.setValue('name', value)
    this.validateName(value)
  }

  validateName (value) {
    this.setError({nameBlank: !value})

    if (!value) {
      this.resetValidation('name')
    } else {
      return this.checkUnique('name', value)
    }
  }

  setDescription = event => {
    let { value } = event.target
    this.setValue('description', value)
    this.validateDescription(value)
  }

  validateDescription (value) {
    this.setError({descriptionBlank: !value})
  }

  setSlug = event => {
    let { value } = event.target
    this.setValue('slug', value)
    this.validateSlug(value)
  }

  validateSlug (value) {
    let error = {slugBlank: false, slugInvalid: false}

    if (!value) {
      error.slugBlank = true
    } else if (!value.match(/^[a-z0-9-+]+$/)) {
      error.slugInvalid = true
    }

    this.setError(error)

    if (any(error)) {
      this.resetValidation('slug')
    } else {
      return this.checkUnique('slug', value)
    }
  }

  setCode = event => {
    let { value } = event.target
    this.setValue('beta_access_code', value)
    this.validateCode(value)
  }

  validateCode (value) {
    this.setError({codeBlank: !value})

    if (!value) {
      this.resetValidation('beta_access_code')
    } else {
      return this.checkUnique('beta_access_code', value)
    }
  }

  setCategory = event => {
    let { value } = event.target
    this.setValue('category', value)
    this.validateCategory(value)
  }

  validateCategory (value) {
    this.setError({categoryBlank: !value})
  }

  setLocation = event => {
    this.setValue('location', event.target.value)
  }

  attachImage (type) {
    let { dispatch } = this.props
    let community = {id: 'new', slug: 'new'}
    switch (type) {
      case 'avatar':
        return dispatch(uploadImage(avatarUploadSettings(community)))
      case 'banner':
        return dispatch(uploadImage(bannerUploadSettings(community)))
    }
  }

  validate () {
    let { community } = this.props
    return Promise.all([
      this.validateName(community.name),
      this.validateDescription(community.description),
      this.validateSlug(community.slug),
      this.validateCode(community.beta_access_code),
      this.validateCategory(community.category)
    ])
  }

  submit = () => {
    let { validating, dispatch, community } = this.props
    if (validating) return

    this.validate().then(() => {
      if (any(this.props.errors)) return scrollToBottom()

      dispatch(createCommunity(community))
      .then(() => {
        if (any(this.props.errors)) return scrollToBottom()
        dispatch(navigate(`/c/${community.slug}`))
      })
    })
  }

  render () {
    let { validating, saving, community, errors } = this.props
    let disableSubmit = any(omit(errors, 'server')) || validating || saving

    return <div id='network-editor' className='form-sections'>
      <h2>Create a network</h2>
      <p>Let's take the first step toward unlocking the creative potential of your network with Hylo.</p>

      <div className='section-label'>Information</div>
      <div className='section'>
        <div className='section-item'>
          <div className='side-column'>
            <label>Network name</label>
          </div>
          <div className='main-column'>
            <input type='text' ref='name' className='form-control' value={community.name} onChange={this.setName}/>
            {errors.nameBlank && <p className='help error'>Please fill in this field.</p>}
            {errors.nameUsed && <p className='help error'>This name is already in use.</p>}
          </div>
        </div>

        <div className='section-item'>
          <div className='side-column'>
            <label>Description</label>
          </div>
          <div className='main-column'>
            <textarea ref='description' className='form-control' onChange={this.setDescription}></textarea>
            {errors.descriptionBlank && <p className='help error'>Please fill in this field.</p>}
          </div>
        </div>

        <div className='section-item'>
          <div className='side-column'>
            <label>URL</label>
          </div>
          <div className='main-column'>
            <div className='input-group'>
              <div className='input-group-addon'>www.hylo.com/c/</div>
              <input ref='slug' className='form-control' onChange={this.setSlug}/>
            </div>
          </div>
        </div>
      </div>

      <div className='section-label'>Appearance</div>
      <div className='section'>
        <div className='section-item'>
          <div className='side-column'>
            <label>Icon</label>
          </div>
          <div className='main-column'>
            <div className='medium-logo' style={{backgroundImage: `url(${community.avatar_url})`}}></div>
            <button onClick={() => this.attachImage('avatar')}>Change</button>
            <p className='help'>This image appears next to your community's name. (Tip: Try a transparent PNG image.)</p>
          </div>
        </div>

        <div className='section-item'>
          <div className='side-column'>
            <label>Banner</label>
          </div>
          <div className='main-column'>
            <div className='banner' style={{backgroundImage: `url(${community.banner_url})`}}></div>
            <button onClick={() => this.attachImage('banner')}>Change</button>
            <p className='help'>
              This image appears across the top of your community page. (Aspect ratio: roughly 3.3:1.)
            </p>
          </div>
        </div>
      </div>

      <div className='section footer'>
        {any(errors) && <p className='help error'>
          {errors.server || 'The information you provided has some errors; please see above.'}
        </p>}
        <button type='button' onClick={this.submit} disabled={disableSubmit}>
          {validating || saving ? 'Please wait...' : 'Save'}
        </button>
      </div>

    </div>
  }
}
