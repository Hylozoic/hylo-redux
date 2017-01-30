import React from 'react'
import { compose } from 'redux'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { fetchCommunities } from '../../actions'
import { FETCH_COMMUNITIES } from '../../constants'
import { fetchWithCache, connectedListProps } from '../../util/caching'
import ScrollListener from '../../components/ScrollListener'
import CommunityCards from '../../components/CommunityCards'
const { array, bool, func, number, object } = React.PropTypes

const subject = 'network'
const fetch = fetchWithCache(fetchCommunities)

var NetworkCommunities = compose(
  prefetch(({ dispatch, params: { id }, query }) => dispatch(fetch(subject, id, query))),
  connect((state, { params: { id }, location: { query } }) => {
    return {
      ...connectedListProps(state, {subject, id, query}, 'communities'),
      network: state.networks[id],
      pending: state.pending[FETCH_COMMUNITIES]
    }
  })
)(props => {
  let { pending, communities } = props

  let loadMore = () => {
    let { communities, dispatch, total, pending, params: { id }, location: { query } } = props
    let offset = communities.length
    if (!pending && offset < total) {
      dispatch(fetch(subject, id, {...query, offset}))
    }
  }

  return <div className='communities'>
    {pending && <div className='loading'>Loading...</div>}
    <CommunityCards communities={communities} />
    <ScrollListener onBottom={loadMore} />
  </div>
})

NetworkCommunities.propTypes = {
  communities: array,
  pending: bool,
  dispatch: func,
  total: number,
  params: object,
  location: object
}

export default NetworkCommunities
