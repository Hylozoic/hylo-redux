import React from 'react'
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

@prefetch(({ dispatch, params: { id }, query }) => dispatch(fetch(subject, id, query)))
@connect((state, { params: { id }, location: { query } }) => {
  return {
    ...connectedListProps(state, {subject, id, query}, 'communities'),
    network: state.networks[id],
    currentUser: state.people.current
  }
})
export default class NetworkMembers extends React.Component {
  static propTypes = {
    communities: array,
    pending: bool,
    dispatch: func,
    total: number,
    params: object,
    location: object,
    currentUser: object
  }

  loadMore = () => {
    let { communities, dispatch, total, pending, params: { id }, location: { query } } = this.props
    let offset = communities.length
    if (!pending && offset < total) {
      dispatch(fetch(subject, id, {...query, offset}))
    }
  }

  updateQuery = opts => {
    let { dispatch, location } = this.props
    dispatch(refetch(opts, location))
  }

  render () {
    let { pending, communities, location: { query }, currentUser } = this.props
    if (!currentUser) return <div>Loading...</div>
    let { search } = query

    return <div className='communities'>
      <div className='list-controls'>
        <input type='text' className='form-control search'
          placeholder='Search'
          defaultValue={search}
          onChange={debounce(event => {
            this.updateQuery({search: event.target.value})
          }, 500)}/>
      </div>
      {pending && <div className='loading'>Loading...</div>}
      <CommunityCards communities={communities}/>
      <ScrollListener onBottom={this.loadMore}/>
    </div>
  }
}
