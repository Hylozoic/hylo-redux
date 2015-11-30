import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { fetch, refetch, ConnectedPostList } from '../../containers/ConnectedPostList'
import cx from 'classnames'
const { func, object } = React.PropTypes

const subject = 'community'

const setDefaults = query => {
  let filter = (query.filter ? query.filter : 'future')
  return {...query, filter, type: 'event', sort: 'start_time'}
}

const CommunityEvents = props => {
  let { params: { id }, location: { query } } = props
  query = setDefaults(query)

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

    refetch(setDefaults({filter}), props, querystringDefaults)
  }

  return <div>
    <div className='post-list-controls'>
      <button className={cx({active: showingPast})} onClick={toggleShowPast}>
        Show past events
      </button>
    </div>
    <ConnectedPostList {...{subject, id, query}}/>
  </div>
}

CommunityEvents.propTypes = {
  dispatch: func,
  params: object,
  community: object
}

export default compose(
  prefetch(({ dispatch, params, query }) => dispatch(fetch(subject, params.id, setDefaults(query)))),
  connect()
)(CommunityEvents)
