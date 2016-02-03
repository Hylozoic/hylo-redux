import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { debounce } from 'lodash'
import { fetchPeople } from '../../actions/fetchPeople'
import { fetchWithCache, connectedListProps, refetch } from '../../util/caching'
import ScrollListener from '../../components/ScrollListener'
import PersonCards from '../../components/PersonCards'
import A from '../../components/A'
const { array, bool, func, number, object } = React.PropTypes
import { canInvite } from '../../models/currentUser'

const subject = 'community'
const fetch = fetchWithCache(fetchPeople)

@prefetch(({ dispatch, params: { id }, query }) => dispatch(fetch(subject, id, query)))
@connect((state, { params: { id }, location: { query } }) => {
  return {
    ...connectedListProps(state, {subject, id, query}, 'people'),
    community: state.communities[id],
    currentUser: state.people.current
  }
})
export default class CommunityMembers extends React.Component {
  static propTypes = {
    people: array,
    pending: bool,
    dispatch: func,
    total: number,
    params: object,
    location: object,
    community: object,
    currentUser: object
  }

  loadMore = () => {
    let { people, dispatch, total, pending, params: { id }, location: { query } } = this.props
    let offset = people.length
    if (!pending && offset < total) {
      dispatch(fetch(subject, id, {...query, offset}))
    }
  }

  updateQuery = opts => {
    let { dispatch, location } = this.props
    dispatch(refetch(opts, location))
  }

  render () {
    let { pending, people, location: { query }, community, currentUser } = this.props
    if (!currentUser) return <div>Loading...</div>
    let { search } = query

    return <div className='members'>
      <div className='list-controls'>
        {canInvite(currentUser, community) && <A className='button' to={`/c/${community.slug}/invite`}>
          Invite members
        </A>}
        <input type='text' className='form-control search'
          placeholder='Search'
          defaultValue={search}
          onChange={debounce(event => this.updateQuery({search: event.target.value}), 500)}/>
      </div>
      {pending && <div className='loading'>Loading...</div>}
      <PersonCards people={people}/>
      <ScrollListener onBottom={this.loadMore}/>
    </div>
  }
}
