// LEJ: This is all the redux business from binding action creators to dispatch
//      to the creating a connected component.
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { reject } from 'lodash'
import { denormalizedPost, getComments } from '../../models/post'
import { getCurrentCommunity } from '../../models/community'
import {
  typeahead,
  showModal,
  navigate,
  completePost,
  followPost,
  removePost,
  startPostEdit,
  voteOnPost,
  pinPost
} from '../../actions'
import { handleMouseOver } from '../Popover'

export function mapStateToProps (state, {post}) {
  return {
    comments: getComments(post, state),
    community: getCurrentCommunity(state),
    post: denormalizedPost(post, state),
    contributorChoices: reject(
      state.typeaheadMatches.contributors, {id: post.user_id}
    )
  }
}

export function mapDispatchToProps (dispatch) {
  const actions = bindActionCreators({
    typeahead,
    showModal,
    navigate,
    completePost,
    followPost,
    removePost,
    startPostEdit,
    voteOnPost,
    pinPost
  }, dispatch)

  return {
    actions,
    personPopoverOnMouseOver: handleMouseOver(dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)
