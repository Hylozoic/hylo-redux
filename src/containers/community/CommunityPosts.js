import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetch, ConnectedPostList } from '../ConnectedPostList'
import PostEditor from '../../components/PostEditor'
import { compose } from 'redux'
import { isMember } from '../../models/currentUser'
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
      {currentUser && <PostEditor community={community}/>}
      <ConnectedPostList {...{subject, id, query}}/>
      {!isMember(currentUser, community) && <div className='post-list-footer'>
        You are not a member of this community, so you are shown only posts that are marked as public.
      </div>}
    </div>
  }
}

export default compose(
  prefetch(({ dispatch, params, query }) => dispatch(fetch(subject, params.id, query))),
  connect((state, { params }) => ({
    community: state.communities[params.id],
    currentUser: state.people.current
  }))
)(CommunityPosts)
