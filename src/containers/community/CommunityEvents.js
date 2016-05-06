import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { fetch, ConnectedPostList } from '../../containers/ConnectedPostList'
import { isMember } from '../../models/currentUser'
import { getCommunity } from '../../models/community'
const { object } = React.PropTypes
import { setDefaults, EventListControls } from '../Events'
import PostEditor from '../../components/PostEditor'

const subject = 'community'

const CommunityEvents = (props, { currentUser }) => {
  let { params: { id }, location, community } = props
  let query = setDefaults(location.query)

  return <div>
    <PostEditor community={community} type='event'/>
    <EventListControls query={query} location={location}/>
    <ConnectedPostList {...{subject, id, query}}/>
    {!isMember(currentUser, community) && <div className='meta footer-meta'>
      You are not a member of this community, so you are shown only posts that are marked as public.
    </div>}
  </div>
}

CommunityEvents.propTypes = {
  params: object,
  community: object
}

CommunityEvents.contextTypes = {currentUser: object}

export default compose(
  prefetch(({ dispatch, params: { id }, query }) =>
    dispatch(fetch(subject, id, setDefaults(query)))),
  connect((state, { params: { id } }) => ({
    community: getCommunity(id, state)
  }))
)(CommunityEvents)
