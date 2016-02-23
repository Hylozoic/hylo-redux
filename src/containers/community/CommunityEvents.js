import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { fetch, ConnectedPostList } from '../../containers/ConnectedPostList'
import { refetch } from '../../util/caching'
import cx from 'classnames'
import { isMember } from '../../models/currentUser'
const { func, object } = React.PropTypes

const subject = 'community'

const setDefaults = query => {
  let filter = (query.filter ? query.filter : 'future')
  return {...query, filter, type: 'event', sort: 'start_time'}
}

const CommunityEvents = props => {
  let { params: { id }, location, dispatch, currentUser, community } = props
  let query = setDefaults(location.query)

  let showingPast = query.filter !== 'future'

  let toggleShowPast = () => {
    // query.filter === 'all' is not recognized on the backend;
    // it's just used here as a placeholder to avoid defaulting to 'future'
    let filter = query.filter === 'future' && 'all'

    // we don't want type=event, sort=start_time, filter=future to show up
    // in the url so we set custom default values for refetch
    let querystringDefaults = {
      type: 'event',
      sort: 'start_time',
      filter: 'future'
    }

    dispatch(refetch(setDefaults({filter}), location, querystringDefaults))
  }

  return <div>
    <div className='list-controls'>
      <button className={cx({active: showingPast})} onClick={toggleShowPast}>
        Show past events
      </button>
    </div>
    <ConnectedPostList {...{subject, id, query}}/>
    {!isMember(currentUser, community) && <div className='meta'>
      You are not a member of this community, so you are shown only posts that are marked as public.
    </div>}
  </div>
}

CommunityEvents.propTypes = {
  dispatch: func,
  params: object,
  community: object,
  currentUser: object
}

export default compose(
  prefetch(({ dispatch, params, query }) => dispatch(fetch(subject, params.id, setDefaults(query)))),
  connect(({ people, communities }, { params }) => ({
    community: communities[params.id],
    currentUser: people.current
  }))
)(CommunityEvents)
