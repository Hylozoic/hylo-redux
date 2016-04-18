import React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetch, ConnectedPostList } from './ConnectedPostList'
import { refetch } from '../util/caching'
import CoverImagePage from '../components/CoverImagePage'
import { setCurrentCommunityId } from '../actions'
import cx from 'classnames'

const subject = 'all-posts'

export const setDefaults = query => {
  let filter = (query.filter ? query.filter : 'future')
  return {...query, filter, type: 'event', sort: 'start_time'}
}

// we don't want type=event, sort=start_time, filter=future to show up
// in the url so we set custom default values for refetch
const querystringDefaults = {
  type: 'event',
  sort: 'start_time',
  filter: 'future'
}

export const toggleShowPast = (showPast, dispatch, location) => {
  // query.filter === 'all' is not recognized on the backend;
  // it's just used here as a placeholder to avoid defaulting to 'future'
  const filter = showPast ? 'all' : 'future'
  dispatch(refetch(setDefaults({filter}), location, querystringDefaults))
}

const Events = compose(
  connect(({ people }) => ({
    currentUser: people.current
  })),
  prefetch(({ dispatch, params, query, currentUser: { id } }) => {
    dispatch(setCurrentCommunityId('all'))
    return dispatch(fetch(subject, id, setDefaults(query)))
  })
)(props => {
  const { dispatch, location, currentUser: { id } } = props
  const query = setDefaults(location.query)
  const showingPast = query.filter !== 'future'
  return <CoverImagePage>
    <div className='list-controls'>
      <button className={cx({active: showingPast})}
        onClick={() => toggleShowPast(!showingPast, dispatch, location)}>
        Show past events
      </button>
    </div>
    <ConnectedPostList {...{subject, id, query}}/>
  </CoverImagePage>
})

export default Events
