import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetch, ConnectedPostList } from '../ConnectedPostList'
import PostEditor from '../../components/PostEditor'
import { PercentBar } from '../../containers/community/CommunityChecklist'
import { compose } from 'redux'
import { isMember, canModerate } from '../../models/currentUser'
import { getChecklist } from '../../models/community'
import { filter } from 'lodash/fp'
import { navigate } from '../../actions'
import { updateCommunityChecklist } from '../../actions/communities'
const { func, object } = React.PropTypes

const subject = 'community'

class CommunityPosts extends React.Component {

  static propTypes = {
    dispatch: func,
    params: object,
    community: object,
    location: object,
    currentUser: object
  }

  static childContextTypes = {
    community: object
  }

  getChildContext () {
    let { community } = this.props
    return {community}
  }

  render () {
    let { community, params: { id }, location: { query }, currentUser } = this.props

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
  prefetch(({ dispatch, params: { id }, query }) => {
    dispatch(updateCommunityChecklist(id))
    dispatch(fetch(subject, id, query))
  }),
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
    onClick={() => dispatch(navigate(`/c/${community.slug}/checklist`))}>
    <PercentBar percent={percent}/>
    Your community is {percent}% set up. Click here to continue setting it up.
  </div>
})
