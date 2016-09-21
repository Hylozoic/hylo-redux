import React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetch, ConnectedPostList } from './ConnectedPostList'
import { paramsForFetch, refetch } from '../util/caching'
import cx from 'classnames'
import { isMember } from '../models/currentUser'
import { getCommunity } from '../models/community'
import PostEditor from '../components/PostEditor'
import { isInCommunity } from '../util'
const { func, object } = React.PropTypes

const setDefaults = query => {
  let filter = (query.filter ? query.filter : 'future')
  return {...query, filter, type: 'event', sort: 'start_time'}
}

const Events = ({ location, params, community }, { currentUser }) => {
  const { subject, id } = paramsForFetch(location, params, currentUser)
  const query = setDefaults(location.query)
  return <div>
    {community && <PostEditor community={community} type='event'/>}
    <EventListControls query={query} location={location}/>
    <ConnectedPostList {...{subject, id, query}}/>
    {community && !isMember(currentUser, community) && <div className='post-list-footer'>
      You are not a member of this community, so you are shown only posts that are marked as public.
    </div>}
  </div>
}
Events.contextTypes = {currentUser: object}

export default compose(
  prefetch(({ dispatch, location, params, query, currentUser }) => {
    const { subject, id } = paramsForFetch(location, params, currentUser)
    return dispatch(fetch(subject, id, setDefaults(query)))
  }),
  connect((state, { location, params: { id } }) => ({
    community: isInCommunity(location) ? getCommunity(id, state) : null
  }))
)(Events)

export const EventListControls = ({ query, location }, { dispatch }) => {
  const showingPast = query.filter !== 'future'

  // we don't want type=event, sort=start_time, filter=future to show up in the
  // url so we set custom default values for refetch
  const querystringDefaults = {
    type: 'event',
    sort: 'start_time',
    filter: 'future'
  }

  const toggleShowPast = (showPast) => {
    // query.filter === 'all' is not recognized on the backend; it's just used
    // here as a placeholder to avoid defaulting to 'future'
    const filter = showPast ? 'all' : 'future'
    dispatch(refetch(setDefaults({filter}), location, querystringDefaults))
  }

  return <div className='list-controls'>
    <button className={cx({active: showingPast})}
      onClick={() => toggleShowPast(!showingPast)}>
      Show past events
    </button>
  </div>
}
EventListControls.contextTypes = {dispatch: func}
