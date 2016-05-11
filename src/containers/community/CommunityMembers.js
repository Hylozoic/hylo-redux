import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { debounce, includes } from 'lodash'
import { FETCH_PEOPLE } from '../../actions'
import { fetchPeople } from '../../actions/fetchPeople'
import { createCacheId, connectedListProps, fetchWithCache, refetch } from '../../util/caching'
import ScrollListener from '../../components/ScrollListener'
import PersonCards from '../../components/PersonCards'
import AccessErrorMessage from '../../components/AccessErrorMessage'
import A from '../../components/A'
const { array, bool, func, number, object } = React.PropTypes
import { canInvite } from '../../models/currentUser'
import { findError } from '../../actions/util'
import qs from 'querystring'

const subject = 'community'
const fetch = fetchWithCache(fetchPeople)

@prefetch(({ dispatch, params: { id }, query }) => dispatch(fetch(subject, id, query)))
@connect((state, { params: { id }, location: { query } }) => {
  let cacheId = createCacheId(subject, id, query)
  return {
    ...connectedListProps(state, {subject, id, query}, 'people'),
    community: state.communities[id],
    currentUser: state.people.current,
    error: findError(state.errors, FETCH_PEOPLE, 'peopleByQuery', cacheId),
    moderatorIds: state.peopleByQuery[qs.stringify({subject: 'community-moderators', id})] || []
  }
})
export default class CommunityMembers extends React.Component {
  static propTypes = {
    people: array,
    moderatorIds: array,
    pending: bool,
    dispatch: func,
    total: number,
    params: object,
    location: object,
    community: object,
    currentUser: object,
    error: object
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
    let { pending, people, moderatorIds, location: { query }, community, currentUser, error } = this.props
    if (error) return <AccessErrorMessage error={error}/>
    if (!currentUser) return <div>Loading...</div>
    let { search } = query
    let peopleWithModeratorFlag = people.map(person => ({
      ...person,
      isModerator: includes(moderatorIds, person.id)
    }))

    return <div className='members'>
      <div className='list-controls'>
        {canInvite(currentUser, community) && <A className='button' to={`/c/${community.slug}/invite`}>
          Invite members
        </A>}
        <input type='text' className='form-control search'
          placeholder='Search'
          defaultValue={search}
          onChange={debounce(event => this.updateQuery({search: event.target.value}))} />
      </div>
      {pending && <div className='loading'>Loading...</div>}
      <PersonCards people={peopleWithModeratorFlag} slug={community.slug}/>
      <ScrollListener onBottom={this.loadMore}/>
    </div>
  }
}
