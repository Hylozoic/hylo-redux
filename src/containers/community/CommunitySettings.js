import React from 'react'
import { connect } from 'react-redux'
import cx from 'classnames'
const { object, func } = React.PropTypes
import { markdown } from '../../util/text'
import { updateCommunitySettings } from '../../actions'
import { uploadImage } from '../../actions/uploadImage'

@connect((state, { params }) => ({community: state.communities[params.id]}))
export default class CommunitySettings extends React.Component {

  constructor (props) {
    super(props)
    this.state = {editing: {}, edited: {}, errors: {}, expand: {}}
  }

  static propTypes = {
    community: object,
    dispatch: func,
    location: object
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

  validate () {
    let { errors } = this.state

    if (errors.name) {
      window.alert('Please provide a community name.')
      this.refs.name.focus()
      return
    }

    return true
  }

  save = (field) => {
    if (!this.validate()) return

    let { dispatch, community } = this.props
    let { editing, edited } = this.state
    this.setState({editing: {...editing, [field]: false}})
    dispatch(updateCommunitySettings({...community, ...edited}, {[field]: community[field]}))
  }

  edit (field) {
    let { community } = this.props
    let { editing, edited } = this.state
    edited[field] = community[field]
    this.setState({editing: {...editing, [field]: true}})
  }

  cancelEdit (field) {
    let { editing } = this.state
    this.setState({editing: {...editing, [field]: false}})
  }

  attachAvatarImage = () => {
    this.attachImage(true)
  }

  attachBannerImage = () => {
    this.attachImage(false)
  }

  attachImage = (avatar) => {
    let { dispatch, community } = this.props
    if (avatar) {
      dispatch(uploadImage({
        id: community.slug,
        subject: 'community-avatar',
        path: `community/${community.id}/avatar`}))
    } else {
      dispatch(uploadImage({
        id: community.slug,
        subject: 'community-banner',
        path: `community/${community.id}/banner`}))
    }
  }

  toggleSection (section, open) {
    let { expand } = this.state
    this.setState({expand: {...expand, [section]: open || !expand[section]}})
  }

  componentDidMount () {
    let { location: { query } } = this.props
    let { expand } = query || {}
    switch (expand) {
      default:
        this.toggleSection('appearance', true)
        break
    }
  }

  render () {
    let { community } = this.props
    let { avatar_url } = community
    let { editing, edited, errors, expand } = this.state

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
                  value={community.description}
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

      </div>}
    </div>
  }
}
