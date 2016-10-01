import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetch, ConnectedPostList } from '../ConnectedPostList'
import PostEditor from '../../components/PostEditor'
import { PercentBar } from '../../containers/ChecklistModal'
import { compose } from 'redux'
import { isMember, canModerate } from '../../models/currentUser'
import { getChecklist, getCommunity } from '../../models/community'
import { filter } from 'lodash/fp'
import { showModal } from '../../actions'
import { updateCommunityChecklist } from '../../actions/communities'
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
    let { checklist } = query || {}
    if (checklist) dispatch(showModal('checklist'))
  }

  render () {
    const { community, params: { id }, location: { query } } = this.props
    const { currentUser } = this.context

    return <div>
      {canModerate(currentUser, community) && <CommunitySetup community={community}/>}
      {currentUser && <PostEditor community={community}/>}
      <ConnectedPostList {...{subject, id, query}}/>
      {!isMember(currentUser, community) && <div className='post-list-footer'>
        You are not a member of this community, so you are shown only posts that are marked as public.
      </div>}
    </div>
  }
}

export default compose(
  prefetch(({ dispatch, params: { id }, query, currentUser, store }) => {
    const community = getCommunity(id, store.getState())
    return (canModerate(currentUser, community)
      ? dispatch(updateCommunityChecklist(id))
      : Promise.resolve())
    .then(() => dispatch(fetch(subject, id, query)))
  }),
  connect((state, { params }) => ({community: state.communities[params.id]}))
)(CommunityPosts)

const CommunitySetup = connect()(({ community, dispatch }) => {
  const checklist = getChecklist(community)
  const percent = filter('done', checklist).length / checklist.length * 100

  if (percent === 100) return null

  return <div className='community-setup'
    onClick={() => dispatch(dispatch(showModal('checklist')))}>
    <PercentBar percent={percent}/>
    Your community is {percent}% set up. <a>Click here</a> to continue setting it up.
  </div>
})
