import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { denormalizedPost, getComments } from '../../models/post'
import { getCurrentCommunity } from '../../models/community'
import { handleMouseOver } from '../Popover'
import {
  showModal,
  navigate,
  followPost,
  removePost,
  startPostEdit,
  voteOnPost,
  pinPost
} from '../../actions'

export function mapsStateToProps (state, { post }) {
  return {
    comments: getComments(post, state),
    community: getCurrentCommunity(state),
    post: denormalizedPost(post, state)
  }
}

export function mapDispatchToProps (dispatch, { post }) {
  let actions = bindActionCreators({
    showModal,
    navigate,
    followPost,
    removePost,
    startPostEdit,
    voteOnPost,
    pinPost
  }, dispatch)
  // LEJ: The dispatch dependent Popover#handleMouseOver is turned into
  //      an "action". The rule here is basically if it needs dispatch it
  //      doesn't go in the component and does go in the connector.
  return {
    actions: {
      ...actions,
      personPopoverOnMouseOver: handleMouseOver(dispatch)
    }
  }
}

export default connect(mapsStateToProps, mapDispatchToProps)
