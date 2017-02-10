import { get } from 'lodash/fp'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  CREATE_COMMENT, UPDATE_COMMENT, UPLOAD_IMAGE
} from '../../actions/constants'
import {
  showModal, createComment, updateComment, updateCommentEditor
} from '../../actions'

export function mapStateToProps (state, { postId, commentId }) {
  const isPending = (actionType, id) =>
    !!id && get(['pending', actionType, 'id'], state) === id

  return ({
    text: postId ? state.commentEdits.new[postId] : state.commentEdits.edit[commentId],
    newComment: !commentId,
    pending: isPending(CREATE_COMMENT, postId) ||
      isPending(UPDATE_COMMENT, commentId) ||
      isPending(UPLOAD_IMAGE, postId)
  })
}

export function mapDispatchToProps (dispatch, { post }) {
  let actions = bindActionCreators({
    showModal,
    createComment,
    updateComment,
    updateCommentEditor
  }, dispatch)
  return { actions }
}

export default connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})
