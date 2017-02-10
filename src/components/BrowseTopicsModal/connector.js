import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { getFollowedTags } from '../../models/community'
import { connectedListProps } from '../../util/caching'
import { fetchTags, followTag } from '../../actions'

const subject = 'community'

export function mapStateToProps (state, { community }) {
  return {
    ...connectedListProps(state, {subject, id: community.slug}, 'tags'),
    followedTags: getFollowedTags(community, state)
  }
}

export function mapDispatchToProps (dispatch, { onboarding }) {
  return {
    actions: bindActionCreators({
      fetchTags: (community, offset = 0) =>
        fetchTags({
          subject,
          limit: 10,
          offset,
          id: community.slug,
          sort: onboarding && 'popularity'
        }),
      followTag
    }, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)
