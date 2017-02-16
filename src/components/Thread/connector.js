import { connect } from 'react-redux'
import { FETCH_COMMENTS } from '../../actions/constants'
import {
  createComment, fetchComments, onThreadPage, offThreadPage
} from '../../actions'
import { getComments } from '../../models/post'
import { bindActionCreators } from 'redux'

export function mapStateToProps (state, { post }) {
  return {
    messages: getComments(post, state),
    pending: state.pending[FETCH_COMMENTS]
  }
}

export function mapDispatchToProps (dispatch, { post }) {
  return {
    actions: {
      ...bindActionCreators({offThreadPage}, dispatch),
      createComment: (text, userId) => dispatch(createComment({postId: post.id, text, userId})),
      onThreadPage: () => dispatch(onThreadPage(post.id)),
      fetchBefore: beforeId =>
        dispatch(fetchComments(post.id,
          {refresh: true, newest: true, limit: 20, beforeId})),
      fetchAfter: afterId =>
        dispatch(fetchComments(post.id, {afterId, refresh: true}))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)
