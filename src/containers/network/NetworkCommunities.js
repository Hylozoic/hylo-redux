import React from 'react'
import { compose } from 'redux'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { debounce } from 'lodash'
import { fetchCommunities } from '../../actions/fetchCommunities'
import { fetchWithCache, connectedListProps, refetch } from '../../util/caching'
import ScrollListener from '../../components/ScrollListener'
import CommunityCards from '../../components/CommunityCards'
const { array, bool, func, number, object } = React.PropTypes

const subject = 'network'
const fetch = fetchWithCache(fetchCommunities)

const NetworkCommunities = compose(
  prefetch(({ dispatch, params: { id }, query }) => dispatch(fetch(subject, id, query))),
  connect((state, { params: { id }, location: { query } }) => {
    return {
      ...connectedListProps(state, {subject, id, query}, 'communities'),
      network: state.networks[id],
      currentUser: state.people.current
    }
  })
)(props => {
  let { pending, communities, location: { query }, currentUser } = props
  if (!currentUser) return <div>Loading...</div>
  let { search } = query

  let loadMore = () => {
    let { communities, dispatch, total, pending, params: { id }, location: { query } } = props
    let offset = communities.length
    if (!pending && offset < total) {
      dispatch(fetch(subject, id, {...query, offset}))
    }
  }

  let updateQuery = opts => {
    let { dispatch, location } = props
    dispatch(refetch(opts, location))
  }

  return <div className='communities'>
    <div className='list-controls'>
      <input type='text' className='form-control search'
        placeholder='Search'
        defaultValue={search}
        onChange={debounce(event => {
          updateQuery({search: event.target.value})
        }, 500)}/>
    </div>
    {pending && <div className='loading'>Loading...</div>}
    <CommunityCards communities={communities}/>
    <ScrollListener onBottom={loadMore}/>
  </div>
})

NetworkCommunities.propTypes = {
  communities: array,
  pending: bool,
  dispatch: func,
  total: number,
  params: object,
  location: object,
  currentUser: object
}

export default NetworkCommunities
