import { connect } from 'react-redux'
import { denormalizedPost, getComments } from '../../models/post'
import { getCurrentCommunity } from '../../models/community'

function mapStateToProps (state, { post }) {
  return {
    post: denormalizedPost(post, state),
    comments: getComments(post, state),
    community: getCurrentCommunity(state),
    isMobile: state.isMobile
  }
}

export default connect(mapStateToProps)
