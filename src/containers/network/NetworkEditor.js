import React from 'react'
import { connect } from 'react-redux'
import { any, get, omit, filter, startsWith, contains, find } from 'lodash'
import {
  CREATE_NETWORK,
  createNetwork,
  navigate,
  resetNetworkValidation,
  updateNetworkEditor,
  validateNetworkAttribute
} from '../../actions'
import { uploadImage } from '../../actions/uploadImage'
import { avatarUploadSettings, bannerUploadSettings } from '../../models/network'
import { scrollToBottom } from '../../util/scrolling'
import TagInput from '../../components/TagInput'
const { bool, func, object, array } = React.PropTypes

const defaultBanner = 'https://d3ngex8q79bk55.cloudfront.net/misc/default_community_banner.jpg'
const defaultAvatar = 'https://d3ngex8q79bk55.cloudfront.net/misc/default_community_avatar.png'

@connect(({people, networkEditor, networkValidation, pending}) => {
  let validating = any(networkValidation.pending)
  let { network, errors } = networkEditor
  let saving = pending[CREATE_NETWORK]

  if (!errors) errors = {}
  errors.nameUsed = get(networkValidation, 'name.unique') === false
  errors.slugUsed = get(networkValidation, 'slug.unique') === false
  errors.codeUsed = get(networkValidation, 'beta_access_code.unique') === false

  if (!network) network = {}
  if (!network.avatar_url) network.avatar_url = defaultAvatar
  if (!network.banner_url) network.banner_url = defaultBanner

  return {network, errors, validating, saving, currentUser: people.current}
})
export default class NetworkEditor extends React.Component {
  static propTypes = {
    saving: bool,
    validating: bool,
    errors: object,
    dispatch: func,
    network: object,
    currentUser: object
  }

  constructor (props) {
    super(props)
    this.state = {communityChoiceTerm: ''}
  }

  setValue = (key, value) => {
    return this.props.dispatch(updateNetworkEditor('network', {[key]: value}))
  }

  setError = obj =>
    this.props.dispatch(updateNetworkEditor('errors', obj))

  resetValidation = key =>
    this.props.dispatch(resetNetworkValidation(key))

  checkUnique = (key, value) =>
    this.props.dispatch(validateNetworkAttribute(key, value, 'unique'))

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

  addCommunity = community => {
    let { communities } = this.props.network
    this.setValue('communities', (communities || []).concat(community.id))
  }

  removeCommunity = community => {
    let { communities } = this.props.network
    this.setValue('communities', filter(communities, cid => cid !== community.id))
  }

  updateCommunityChoiceTerm = term => {
    this.setState({communityChoiceTerm: term})
  }

  getCommunityChoices = term => {
    if (!term) {
      return []
    }

    let { currentUser, network: { communities } } = this.props
    var match = c =>
      startsWith(c.name.toLowerCase(), term.toLowerCase()) &&
      !contains(communities, c.id)

    return filter(currentUser.memberships.map(m => m.community), match)
  }

  attachImage (type) {
    let { dispatch } = this.props
    let network = {id: 'new', slug: 'new'}
    switch (type) {
      case 'avatar':
        return dispatch(uploadImage(avatarUploadSettings(network)))
      case 'banner':
        return dispatch(uploadImage(bannerUploadSettings(network)))
    }
  }

  validate () {
    let { network } = this.props
    return Promise.all([
      this.validateName(network.name),
      this.validateDescription(network.description),
      this.validateSlug(network.slug)
    ])
  }

  submit = () => {
    let { validating, dispatch, network } = this.props
    if (validating) return

    this.validate().then(() => {
      if (any(this.props.errors)) return scrollToBottom()

      dispatch(createNetwork(network))
      .then(() => {
        if (any(this.props.errors)) return scrollToBottom()
        dispatch(navigate(`/n/${network.slug}`))
      })
    })
  }

  render () {
    let { validating, saving, network, errors } = this.props
    let { communities } = network
    let disableSubmit = any(omit(errors, 'server')) || validating || saving
    let { communityChoiceTerm } = this.state
    let communityChoices = this.getCommunityChoices(communityChoiceTerm)

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
            <input type='text' ref='name' className='form-control' value={network.name} onChange={this.setName}/>
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
              <div className='input-group-addon'>www.hylo.com/n/</div>
              <input ref='slug' className='form-control' onChange={this.setSlug}/>
            </div>
            {errors.slugBlank && <p className='help error'>Please fill in this field.</p>}
            {errors.slugInvalid && <p className='help error'>Use lowercase letters, numbers, and hyphens only.</p>}
            {errors.slugUsed && <p className='help error'>This URL is already in use.</p>}
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
            <div className='medium-logo' style={{backgroundImage: `url(${network.avatar_url})`}}></div>
            <button onClick={() => this.attachImage('avatar')}>Change</button>
            <p className='help'>This image appears next to your networks's name. (Tip: Try a transparent PNG image.)</p>
          </div>
        </div>

        <div className='section-item'>
          <div className='side-column'>
            <label>Banner</label>
          </div>
          <div className='main-column'>
            <div className='banner' style={{backgroundImage: `url(${network.banner_url})`}}></div>
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

// network.communities is a list of ids, but the tag input needs
// names and icons as well, so this component does the mapping
@connect(({ communities }, { ids }) => ({
  communities: (ids || []).map(id => find(communities, c => c.id === id))
}))
class CommunityTagInput extends React.Component {
  static propTypes = {
    ids: array,
    communities: array,
    choices: array
  }

  render () {
    let { communities, ...otherProps } = this.props
    return <TagInput tags={communities} {...otherProps}/>
  }
}
