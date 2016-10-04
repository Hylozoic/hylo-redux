import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetch, ConnectedPostList } from '../ConnectedPostList'
import PostEditor from '../../components/PostEditor'
import { PercentBar } from '../../containers/ChecklistModal'
import { compose } from 'redux'
import { isMember, canModerate, hasFeature } from '../../models/currentUser'
import { getChecklist } from '../../models/community'
import { filter } from 'lodash/fp'
import { showModal } from '../../actions'
const { func, object } = React.PropTypes

const subject = 'community'

class CommunityPosts extends React.Component {
  static propTypes = {
    dispatch: func,
    params: object,
    community: object,
    location: object
  }
  static contextTypes = {currentUser: object}
  static childContextTypes = {community: object}

  getChildContext () {
    let { community } = this.props
    return {community}
  }

  componentDidMount () {
    let { location: { query }, dispatch } = this.props
    const { currentUser } = this.context
    let { checklist } = query || {}
    if (checklist && hasFeature(currentUser, 'COMMUNITY_SETUP_CHECKLIST')) {
      dispatch(showModal('checklist'))
    }
  }

  render () {
    const { community, params: { id }, location: { query } } = this.props
    const { currentUser } = this.context

    return <div>
      {hasFeature(currentUser, 'COMMUNITY_SETUP_CHECKLIST') && canModerate(currentUser, community) &&
        <CommunitySetup community={community}/>}
      {currentUser && <PostEditor community={community}/>}
      <ConnectedPostList {...{subject, id, query}}/>
      {!isMember(currentUser, community) && <div className='post-list-footer'>
        You are not a member of this community, so you are shown only posts that are marked as public.
      </div>}
    </div>
  }
}

export default compose(
  prefetch(({ dispatch, params: { id }, query, currentUser, store }) =>
    dispatch(fetch(subject, id, query))),
  connect((state, { params }) => ({
    community: state.communities[params.id],
    currentUser: state.people.current
  }))
)(CommunityPosts)

const CommunitySetup = connect()(({ community, dispatch }) => {
  const checklist = getChecklist(community)
  const percent = filter('done', checklist).length / checklist.length * 100

  if (percent === 100) return null

  return <div className='community-setup'
    onClick={() => dispatch(showModal('checklist'))}>
    <PercentBar percent={percent}/>
    Your community is {percent}% set up. <a>Click here</a> to continue setting it up.
  </div>
})
