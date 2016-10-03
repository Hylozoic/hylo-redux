import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { get, some, omit, filter, startsWith, contains } from 'lodash'
import { fetchWithCache } from '../../util/caching'
import { scrollToBottom } from '../../util/scrolling'
import { fetchCommunities } from '../../actions/communities'
import { uploadImage } from '../../actions/uploadImage'
import { avatarUploadSettings, bannerUploadSettings } from '../../models/network'
import {
  CREATE_NETWORK,
  UPLOAD_IMAGE,
  navigate,
  typeahead
} from '../../actions'
import {
  createNetwork,
  resetNetworkValidation,
  updateNetworkEditor,
  validateNetworkAttribute,
  fetchNetwork,
  updateNetwork
} from '../../actions/network'
import CommunityTagInput from '../../components/CommunityTagInput'
const { array, bool, func, object, string } = React.PropTypes

const defaultBanner = 'https://d3ngex8q79bk55.cloudfront.net/misc/default_community_banner.jpg'
const defaultAvatar = 'https://d3ngex8q79bk55.cloudfront.net/misc/default_community_avatar.png'

const typeaheadId = 'network_communities'

const subject = 'network'
const fetch = fetchWithCache(fetchCommunities)
const query = {offset: 0, limit: 1000}

@prefetch(({ dispatch, params: { id } }) => {
  id && dispatch(fetchNetwork(id, true))
  return dispatch(fetch(subject, id, query))
})
@connect((state, { params: { id } }) => {
  let { networks, networkValidation, pending, typeaheadMatches, networkEdits } = state

  let saving = pending[CREATE_NETWORK]
  let uploadingImage = !!pending[UPLOAD_IMAGE]

  if (!id) id = 'new'

  let network = networks[id]

  let networkEdit = {...network, ...networkEdits[id]}

  let validation = networkValidation[id] || {}
  let validating = some(validation.pending)

  let { errors } = networkEdit

  if (!errors) errors = {}
  errors.nameUsed = get(validation, 'name.unique') === false
  errors.slugUsed = get(validation, 'slug.unique') === false

  if (!networkEdit.avatar_url) networkEdit.avatar_url = defaultAvatar
  if (!networkEdit.banner_url) networkEdit.banner_url = defaultBanner

  return {
    communityChoices: typeaheadMatches[typeaheadId] || [],
    creating: id === 'new',
    id, network, networkEdit, errors, validating, saving, uploadingImage
  }
})
export default class NetworkEditor extends React.Component {
  static propTypes = {
    id: string,
    saving: bool,
    uploadingImage: bool,
    validating: bool,
    errors: object,
    dispatch: func,
    network: object,
    networkEdit: object,
    communityChoices: array,
    params: object,
    creating: bool
  }

  static contextTypes = {currentUser: object}

  setValue = (key, value) => {
    let { id, dispatch } = this.props
    return dispatch(updateNetworkEditor(id, {[key]: value}))
  }

  setError = obj =>
    this.setValue('errors', obj)

  resetValidation = key =>
    this.props.dispatch(resetNetworkValidation(this.props.id, key))

  checkUnique = (key, value) =>
    this.props.dispatch(validateNetworkAttribute(this.props.id, key, value, 'unique'))

  setName = event => {
    let { value } = event.target
    this.setValue('name', value)
    this.validateName(value)
  }

  validateName (value) {
    let {creating, network} = this.props

    this.setError({nameBlank: !value})
    if (!value) {
      this.resetValidation('name')
    } else if (creating || value !== network.name) {
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
    let { creating } = this.props
    let error = {slugBlank: false, slugInvalid: false}

    if (!value) {
      error.slugBlank = true
    } else if (!value.match(/^[a-z0-9-+]+$/)) {
      error.slugInvalid = true
    }

    this.setError(error)

    if (some(error)) {
      this.resetValidation('slug')
    } else if (creating) {
      return this.checkUnique('slug', value)
    }
  }

  addCommunity = community => {
    let { communities } = this.props.networkEdit
    this.setValue('communities', (communities || []).concat(community.id))
  }

  removeCommunity = community => {
    let { communities } = this.props.networkEdit
    this.setValue('communities', filter(communities, cid => cid !== community.id))
  }

  updateCommunityChoiceTerm = term => {
    let { dispatch } = this.props
    dispatch(typeahead(term, typeaheadId, {type: 'communities', moderated: true}))
  }

  getCommunityChoices = term => {
    if (!term) {
      return []
    }

    let { networkEdit: { communities } } = this.props
    const { currentUser } = this.context
    var match = c =>
      startsWith(c.name.toLowerCase(), term.toLowerCase()) &&
      !contains(communities, c.id)

    return filter(filter(currentUser.memberships, m => m.role === 1).map(m => m.community), match)
  }

  attachImage (type) {
    let { dispatch, id } = this.props
    let network = {id: id}
    switch (type) {
      case 'avatar':
        return dispatch(uploadImage(avatarUploadSettings(network)))
      case 'banner':
        return dispatch(uploadImage(bannerUploadSettings(network)))
    }
  }

  validate () {
    let { networkEdit } = this.props
    return Promise.all([
      this.validateName(networkEdit.name),
      this.validateDescription(networkEdit.description),
      this.validateSlug(networkEdit.slug)
    ])
  }

  submit = () => {
    let { validating, dispatch, id, network, networkEdit } = this.props

    if (validating) return

    this.validate().then(() => {
      if (some(this.props.errors)) return scrollToBottom()

      dispatch((network ? updateNetwork(id, networkEdit) : createNetwork(networkEdit)))
      .then(() => {
        if (some(this.props.errors)) return scrollToBottom()
        dispatch(navigate(`/n/${networkEdit.slug}`))
      })
    })
  }

  render () {
    let {
      creating, validating, saving, uploadingImage, networkEdit, errors,
      communityChoices
    } = this.props
    const { currentUser: { is_admin } } = this.context
    let { name, description, slug, avatar_url, banner_url, communities } = networkEdit
    let disableSubmit = some(omit(errors, 'server')) || validating || saving || uploadingImage

    return <div id='network-editor' className='form-sections simple-page'>
      { creating ? <h2>Create a network</h2> : <h2>Edit network</h2> }
      <p>Let's take the first step toward unlocking the creative potential of your network with Hylo.</p>

      <div className='section-label'>Information</div>
      <div className='section'>
        <div className='section-item'>
          <div className='side-column'>
            <label>Network name</label>
          </div>
          <div className='main-column'>
            <input type='text' ref='name' className='form-control' value={name} onChange={this.setName}/>
            {errors.nameBlank && <p className='help error'>Please fill in this field.</p>}
            {errors.nameUsed && <p className='help error'>This name is already in use.</p>}
          </div>
        </div>

        <div className='section-item'>
          <div className='side-column'>
            <label>Description</label>
          </div>
          <div className='main-column'>
            <textarea ref='description' className='form-control' value={description} onChange={this.setDescription}></textarea>
            {errors.descriptionBlank && <p className='help error'>Please fill in this field.</p>}
          </div>
        </div>

        {(creating || is_admin) && <div className='section-item'>
          <div className='side-column'>
            <label>URL</label>
          </div>
          <div className='main-column'>
            <div className='input-group'>
              <div className='input-group-addon'>www.hylo.com/n/</div>
              <input ref='slug' className='form-control' value={slug} onChange={this.setSlug}/>
            </div>
            {!creating && is_admin && <p className='meta'>Warning: changing slug will break links to this network.</p>}
            {errors.slugBlank && <p className='help error'>Please fill in this field.</p>}
            {errors.slugInvalid && <p className='help error'>Use lowercase letters, numbers, and hyphens only.</p>}
            {errors.slugUsed && <p className='help error'>This URL is already in use.</p>}
          </div>
        </div>}
      </div>

      <div className='section-label'>Appearance</div>
      <div className='section'>
        <div className='section-item'>
          <div className='side-column'>
            <label>Icon</label>
          </div>
          <div className='main-column'>
            <div className='medium-logo' style={{backgroundImage: `url(${avatar_url})`}}></div>
            <button onClick={() => this.attachImage('avatar')}>Change</button>
            <p className='help'>This image appears next to your networks's name. (Tip: Try a transparent PNG image.)</p>
          </div>
        </div>

        <div className='section-item'>
          <div className='side-column'>
            <label>Banner</label>
          </div>
          <div className='main-column'>
            <div className='banner' style={{backgroundImage: `url(${banner_url})`}}></div>
            <button onClick={() => this.attachImage('banner')}>Change</button>
            <p className='help'>
              This image appears across the top of your network page. (Aspect ratio: roughly 3.3:1.)
            </p>
          </div>
        </div>
      </div>

      <div className='section-label'>Communities</div>
      <div className='section'>
        <div className='section-item'>
          <div className='side-column'>
            <label>Communities</label>
          </div>
          <div className='main-column'>
            <CommunityTagInput ids={communities}
              handleInput={this.updateCommunityChoiceTerm}
              choices={communityChoices}
              onSelect={this.addCommunity}
              onRemove={this.removeCommunity}/>
          </div>
        </div>
      </div>

      <div className='section footer'>
        {some(errors) && <p className='help error'>
          {errors.server || 'The information you provided has some errors; please see above.'}
        </p>}
        <button type='button' onClick={this.submit} disabled={disableSubmit}>
          {validating || saving || uploadingImage ? 'Please wait...' : 'Save'}
        </button>
      </div>

    </div>
  }
}
