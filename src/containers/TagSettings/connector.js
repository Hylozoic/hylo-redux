import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { compose } from 'redux'
import {
  fetchTags, removeTagFromCommunity, updateCommunityTag, showModal
} from '../../actions'
import { getCurrentCommunity } from '../../models/community'
import { connectedListProps } from '../../util/caching'
const subject = 'community'

export function fetchToState ({ params: { id }, dispatch }) {
  return dispatch(fetchTags({subject, id}))
}

export function mapStateToProps (state, { params: { id }, location: { query } }) {
  return ({
    ...connectedListProps(state, {subject, id, query}, 'tags'),
    community: getCurrentCommunity(state)
  })
}

export const mapDispatchToProps = {fetchTags, removeTagFromCommunity, updateCommunityTag, showModal}

export default compose(
  prefetch(fetchToState),
  connect(mapStateToProps, mapDispatchToProps)
)
