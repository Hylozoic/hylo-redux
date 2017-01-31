import React from 'react'
import { connect } from 'react-redux'
import {
  updateCurrentUser, updateCommunitySettings, uploadImage
} from '../actions'
import { UPLOAD_IMAGE } from '../actions/constants'
import { get, set } from 'lodash/fp'
import Icon from './Icon'
import {
  avatarUploadSettings as personAvatarUploadSettings, bannerUploadSettings as personBannerUploadSettings
} from '../models/person'
import {
  avatarUploadSettings as communityAvatarUploadSettings, bannerUploadSettings as communityBannerUploadSettings
} from '../models/community'

const ChangeImageButton = ({ person, community, type, dispatch, pending }) => {
  const pendingId = get('id', pending)
  const pendingSubject = get('subject', pending)
  const loading = (pendingId === get('id', person) &&
    ((type === 'avatar_url' && pendingSubject === 'user-avatar') ||
     (type === 'banner_url' && pendingSubject === 'user-banner'))) ||
  (pendingId === get('slug', community) &&
    ((type === 'avatar_url' && pendingSubject === 'community-avatar') ||
     (type === 'banner_url' && pendingSubject === 'community-banner')))

  var uploadSettings
  var update

  if (person) {
    update = value => dispatch(updateCurrentUser({[type]: value}))
    switch (type) {
      case 'avatar_url':
        uploadSettings = personAvatarUploadSettings(person)
        break
      case 'banner_url':
        uploadSettings = personBannerUploadSettings(person)
    }
  } else if (community) {
    const { slug, id } = community
    update = value => dispatch(updateCommunitySettings(id, set(type, value, {slug})))
    switch (type) {
      case 'avatar_url':
        uploadSettings = communityAvatarUploadSettings(community)
        break
      case 'banner_url':
        uploadSettings = communityBannerUploadSettings(community)
    }
  }

  const onClick = loading
    ? () => {}
    : () => dispatch(uploadImage(uploadSettings))
    .then(action => {
      let { error, payload } = action
      if (error) return
      update(payload)
    })

  return <a className='edit-link' onClick={onClick}>
    {loading ? <Icon name='Clock' /> : <Icon name='Camera' />}
  </a>
}

export default connect((state, props) => ({
  pending: get(UPLOAD_IMAGE, state.pending)
}))(ChangeImageButton)
