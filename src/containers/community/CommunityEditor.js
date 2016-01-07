import React from 'react'
import { connect } from 'react-redux'
import { any, get, pairs } from 'lodash'
import { updateCommunityEditor, resetCommunityValidation, validateCommunityAttribute } from '../../actions'
const { bool, func, object } = React.PropTypes

const categories = {
  'coworking': 'Co-working space',
  'makerspace': 'Maker space',
  'startupAccelerator': 'Startup accelerator',
  'communityCenter': 'Community center',
  'localAffinityNetwork': 'Local affinity network',
  'distributedAffinityNetwork': 'Distributed affinity network',
  'event': 'Special event',
  'neighborhood': 'Neighborhood',
  'alumniCommunity': 'Alumni community',
  'organization': 'Organization',
  'other': 'Other'
}

@connect(({communityEditor, communityValidation}) => {
  let validating = any(communityValidation.pending)
  let submitting = get(communityEditor, 'submission.started')
  let errors = {...communityEditor.errors}
  errors.nameUsed = get(communityValidation, 'name.unique') === false
  errors.slugUsed = get(communityValidation, 'slug.unique') === false
  errors.codeUsed = get(communityValidation, 'beta_access_code.unique') === false

  return {...communityEditor, errors, validating, submitting}
})
export default class CommunityEditor extends React.Component {
  static propTypes = {
    saving: bool,
    validating: bool,
    submitting: bool,
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
      this.checkUnique('name', value)
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
      this.checkUnique('slug', value)
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
      this.checkUnique('beta_access_code', value)
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

  validate () {
    this.validateName(this.refs.name.value)
    this.validateDescription(this.refs.description.value)
    this.validateSlug(this.refs.slug.value)
    this.validateCode(this.refs.code.value)
    this.validateCategory(this.refs.category.value)
  }

  submit = () => {
    let { dispatch } = this.props
    dispatch(updateCommunityEditor('submission', {started: true}))
    this.validate()
  }

  componentDidUpdate () {
    let { validating, submitting, errors, dispatch } = this.props
    if (!validating && submitting) {
      if (!any(errors)) {
        console.log('SUBMIT!')
      } else {
        dispatch(updateCommunityEditor('submission', {started: false}))
      }
    }
  }

  render () {
    let { saving } = this.props
    let community = this.props.community || {}
    let errors = this.props.errors || {}

    return <div id='community-editor' className='form-sections'>
      <h2>Create a community</h2>
      <p>Let's take the first step toward unlocking the creative potential of your community with Hylo.</p>

      <div className='section-label'>Information</div>
      <div className='section'>
        <div className='section-item'>
          <div className='side-column'>
            <label>Community name</label>
          </div>
          <div className='main-column'>
            <input type='text' ref='name' className='form-control' value={community.name} onChange={this.setName}/>
            {errors.nameBlank && <p className='help error'>Please fill in this field.</p>}
            {errors.nameUsed && <p className='help error'>This name is already in use.</p>}
          </div>
        </div>

        <div className='section-item'>
          <div className='side-column'>
            <label>Core Intention</label>
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
            {errors.slugBlank && <p className='help error'>Please fill in this field.</p>}
            {errors.slugInvalid && <p className='help error'>Use lowercase letters, numbers, and hyphens only.</p>}
            {errors.slugUsed && <p className='help error'>This URL is already in use.</p>}
          </div>
        </div>

        <div className='section-item'>
          <div className='side-column'>
            <label>Invitation code</label>
          </div>
          <div className='main-column'>
            <input ref='code' type='text' className='form-control' onChange={this.setCode}/>
            <p className='help'>People can use this code to join your community. (You will also be able to send email invitations to people directly, which do not require this code.)</p>
            {errors.codeBlank && <p className='help error'>Please fill in a code.</p>}
            {errors.codeUsed && <p className='help error'>This code cannot be used; please choose another.</p>}
          </div>
        </div>

        <div className='section-item'>
          <div className='side-column'>
            <label>What kind of community is this?</label>
          </div>
          <div className='main-column'>
            <select ref='category' className='form-control' onChange={this.setCategory}>
              <option value=''>Pick one:</option>
              {pairs(categories).map(([value, label]) => <option key={value} value={value}>
                {label}
              </option>)}
            </select>

            {errors.categoryBlank && <p className='help error'>Please choose one.</p>}
          </div>
        </div>

        <div className='section-item'>
          <div className='side-column'>
            <label>Location</label>
          </div>
          <div className='main-column'>
            <input type='text' ref='location' className='form-control'
              placeholder='Optionally, choose a location for your community' />
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
            <div className='community-icon' back-img='community.avatar_url'></div>
            <button ng-click='changeIcon()'>
              <span ng-hide='uploading.avatar_url'>Change</span>
              <span ng-show='uploading.avatar_url'>Please wait...</span>
            </button>
            <p className='help'>This image appears next to your community's name. (Tip: Try a transparent PNG image.)</p>
          </div>
        </div>

        <div className='section-item'>
          <div className='side-column'>
            <label>Banner</label>
          </div>
          <div className='main-column'>
            <div className='banner' back-img='community.banner_url'></div>
            <button ng-click='changeBanner()'>
              <span ng-hide='uploading.banner_url'>Change</span>
              <span ng-show='uploading.banner_url'>Please wait...</span>
            </button>
            <p className='help'>This image appears across the top of your community page. (Suggested size: 1400x500 pixels. <a href='http://cdn.hylo.com/misc/example_community_page.jpg' target='_blank'>See an example.</a>)</p>
          </div>
        </div>
      </div>

      <p>All of the settings above can be changed later, except for the URL.</p>

      <p>The product is currently free of charge for communities of 100 or fewer people. If your community exceeds 100 people, we'll contact you to discuss payment options. If you have any questions about this now, feel free to send us a message using the chat widget in the lower right of your screen.</p>

      <p>By creating this community you are agreeing to moderate posted content and report any objectionable content via the built-in reporting mechanisms.</p>

      <div className='section footer'>
        <button type='button' onClick={this.submit} disabled={any(errors) || saving}>
          {saving ? 'Please wait...' : 'Save'}
        </button>
        {any(errors) && <p className='help error'>The information you provided has some errors; please see above.</p>}
      </div>

    </div>
  }
}
