import { connect } from 'react-redux'
import { navigate } from '../../actions'
import { getComments, denormalizedPost } from '../../models/post'
import { getCurrentCommunity } from '../../models/community'

export function mapStateToProps (state, { post }) {
  return {
    comments: getComments(post, state),
    community: getCurrentCommunity(state),
    isMobile: state.isMobile,
    post: denormalizedPost(post, state)
  }
}

export default connect(mapStateToProps, {
  navigate
})
