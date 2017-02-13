import { get } from 'lodash/fp'
import { connect } from 'react-redux'
import { createComment } from '../../actions'
import { CREATE_COMMENT, UPLOAD_IMAGE } from '../../actions/constants'

export function mapStateToProps (state, { postId, commentId }) {
  const isPending = (actionType, id) =>
    !!id && get(['pending', actionType, 'id'], state) === id

  return ({
    pending: isPending(CREATE_COMMENT, postId) ||
      isPending(UPLOAD_IMAGE, postId)
  })
}

export const mapDispatchToProps = { createComment }
export default connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})
