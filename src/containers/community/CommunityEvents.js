import React from 'react'
import { prefetch } from 'react-fetcher'
import { fetch, ConnectedPostList } from '../../containers/ConnectedPostList'
const { func, object } = React.PropTypes

const subject = 'community'
const query = {type: 'event', sort: 'start_time'} // TODO: toggle showing past events

const CommunityEvents = props => {
  let { id } = props.params
  return <div>
    <ConnectedPostList {...{subject, id, query}}/>
  </div>
}

CommunityEvents.propTypes = {
  dispatch: func,
  params: object,
  community: object
}

export default prefetch(({ dispatch, params }) =>
  dispatch(fetch(subject, params.id, query)))(CommunityEvents)
