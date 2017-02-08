import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { denormalizedPost, getComments } from '../../models/post'
import { getCurrentCommunity } from '../../models/community'
import { handleMouseOver } from '../Popover'
import {
  voteOnPost
} from '../../actions'

export function mapStateToProps (state, { post, parentPost }) {
  const props = {
    comments: getComments(post, state),
    community: getCurrentCommunity(state),
    post: denormalizedPost(post, state)
  }
  if (parentPost) props.parentPost = denormalizedPost(parentPost, state)
  return props
}

export function mapDispatchToProps (dispatch, { post }) {
  const actions = bindActionCreators({
    voteOnPost
  }, dispatch)
  return {
    actions: {
      ...actions,
      onMouseOver: handleMouseOver(dispatch)
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)
