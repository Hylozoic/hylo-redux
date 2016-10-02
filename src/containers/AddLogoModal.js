import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { set } from 'lodash'
import { getCurrentCommunity, avatarUploadSettings, bannerUploadSettings } from '../models/community'
import { closeModal } from '../actions'
import { uploadImage } from '../actions/uploadImage'
import { Modal } from '../components/Modal'
import { fetchCommunity, updateCommunityChecklist } from '../actions/communities'
import { updateCommunitySettings } from '../actions/communities'
const { func, object } = React.PropTypes

@prefetch(({ dispatch, params: { id } }) =>
  dispatch(fetchCommunity(id))
)
@connect((state) => ({
  community: getCurrentCommunity(state)
}))
export default class ChecklistModal extends React.Component {
  static propTypes = {
    dispatch: func,
    community: object,
    onCancel: func
  }

  update (path, value) {
    let { dispatch, community: { id, slug } } = this.props
    return dispatch(updateCommunitySettings(id, set({slug}, path, value)))
    .then(() => dispatch(updateCommunityChecklist(slug)))
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

  render () {
    const { dispatch, onCancel, community } = this.props
    const { avatar_url, banner_url } = community
    const close = () => dispatch(closeModal())

    return <Modal title='Add a logo and banner'
      className='form-sections'
      onCancel={onCancel}>
      <div className='section-item icon'>
        <div className='half-column'>
          <label>Icon</label>
          <p className='summary'>This image appears next to your community&rsquo;s name. (Tip: Try a transparent PNG image.)</p>
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
      <div className='footer'>
        <a className='button ok' onClick={close}>
          Done
        </a>
      </div>
    </Modal>
  }
}
