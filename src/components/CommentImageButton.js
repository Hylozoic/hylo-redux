import React from 'react'
import Icon from './Icon'
import { notify } from '../actions'
import { uploadImage } from '../actions/uploadImage'
import { imageUploadSettings } from '../models/comment'
import { hasFeature } from '../models/currentUser'
import { COMMENT_IMAGES } from '../config/featureFlags'
import { createComment } from '../actions/comments'
import { get } from 'lodash/fp'

const CommentImageButton = ({ postId }, { dispatch, currentUser }) => {
  if (!hasFeature(currentUser, COMMENT_IMAGES)) return null

  const sendImage = () =>
    dispatch(uploadImage(imageUploadSettings(currentUser.id, postId)))
    .then(({ payload, error }) => {
      if (error) {
        if (payload === 'Cancelled' || get('code', payload) === 101) return
        return dispatch(notify('There was a problem sending your image. Please try again in a moment', {type: 'error'}))
      }
      return dispatch(createComment({postId, imageUrl: payload}))
    })

  return <a className='send-image' onClick={sendImage}><Icon name='Camera' /></a>
}
CommentImageButton.contextTypes = {
  dispatch: React.PropTypes.func, currentUser: React.PropTypes.object
}

export default CommentImageButton
