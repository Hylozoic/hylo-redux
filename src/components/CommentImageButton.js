import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Icon from './Icon'
import { notify, uploadImage, createComment } from '../actions'
import { UPLOAD_IMAGE } from '../actions/constants'
import { imageUploadSettings } from '../models/comment'
import { hasFeature } from '../models/currentUser'
import { COMMENT_IMAGES } from '../config/featureFlags'
import { get } from 'lodash/fp'
const { func, object, shape } = React.PropTypes

export function CommentImageButton (
  { postId, pending, actions: { uploadImage, createComment, notify } },
  { currentUser }
) {
  if (!hasFeature(currentUser, COMMENT_IMAGES)) return null

  const sendImage = () =>
    uploadImage(imageUploadSettings(currentUser.id, postId))
    .then(({ payload, error }) => {
      if (error) {
        if (payload === 'Cancelled' || get('code', payload) === 101) return
        return notify('There was a problem sending your image. Please try again in a moment', {type: 'error'})
      }
      return createComment({postId, imageUrl: payload})
    })

  return <a className='send-image' onClick={pending ? () => {} : sendImage}>
    <Icon name={pending ? 'Clock' : 'Camera'} />
  </a>
}
CommentImageButton.contextTypes = {
  actions: shape({
    createComment: func.isRequired,
    notify: func.isRequired,
    uploadImage: func.isRequired
  }),
  currentUser: object.isRequired
}

const mapStateToProps = (state, props) => ({
  pending: get([UPLOAD_IMAGE, 'subject'], state.pending) === 'comment-image'
})

export function mapDispatchToProps (dispatch, { post }) {
  const actions = bindActionCreators({
    createComment, notify, uploadImage
  }, dispatch)
  return { actions }
}

export default connect(mapStateToProps, mapDispatchToProps)(CommentImageButton)
