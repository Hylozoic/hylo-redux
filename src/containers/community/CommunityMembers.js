import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { debounce, includes } from 'lodash'
import { FETCH_PEOPLE } from '../../actions'
import { fetchPeople } from '../../actions/fetchPeople'
import { createCacheId, connectedListProps, fetchWithCache, refetch } from '../../util/caching'
import Icon from '../../components/Icon'
import ScrollListener from '../../components/ScrollListener'
import PersonCards from '../../components/PersonCards'
import AccessErrorMessage from '../../components/AccessErrorMessage'
import A from '../../components/A'
const { array, bool, func, number, object } = React.PropTypes
import { canInvite } from '../../models/currentUser'
import { findError } from '../../actions/util'
import qs from 'querystring'
import { NonLinkAvatar } from '../../components/Avatar'
import { humanDate } from '../../util/text'

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
    moderatorIds: state.peopleByQuery[qs.stringify({subject: 'community-moderators', id})] || [],
    isMobile: state.isMobile
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
    error: object,
    isMobile: bool
  }

  loadMore = () => {
    let { people, dispatch, total, pending, params: { id }, location: { query } } = this.props
    let offset = people.length
    if (!pending && offset < total) {
      dispatch(fetch(subject, id, {...query, offset}))
    }
  }

  updateQuery = debounce(opts => {
    let { dispatch, location } = this.props
    dispatch(refetch(opts, location))
  }, 200)

  render () {
    const {
      pending, moderatorIds, location: { query }, community, currentUser, error,
      total, isMobile
    } = this.props
    if (error) return <AccessErrorMessage error={error}/>
    if (!currentUser) return <div>Loading...</div>
    let { search } = query
    const people = this.props.people.map(person => ({
      ...person,
      isModerator: includes(moderatorIds, person.id)
    }))

    return <div className='members'>
      <div className='search-bar'>
        <Icon name='Loupe' />
        <input type='text'
          placeholder='Search'
          defaultValue={search}
          onChange={event => this.updateQuery({search: event.target.value})} />
      </div>
      <div className='member-controls'>
        {total} member{total === 1 ? '' : 's'}
        {canInvite(currentUser, community) && <A to={`/c/${community.slug}/invite`}>
          Invite members
        </A>}
      </div>
      {pending && <div className='loading'>Loading...</div>}
      {isMobile
        ? people.map(person => <PersonRow person={person} key={person.id}/>)
        : <PersonCards people={people} slug={community.slug}/>}
      <ScrollListener onBottom={this.loadMore}/>
    </div>
  }
}

const PersonRow = ({ person }) => {
  const { id, name, joined_at, isModerator } = person
  return <A className='person-row' to={`/u/${id}`}>
    <NonLinkAvatar person={person}/>
    <span className='name'>{name}</span>
    <span className='subtitle'>
      {isModerator ? 'Moderator' : 'Member'}
      {joined_at && <span>&nbsp;since {humanDate(joined_at)}</span>}
    </span>
  </A>
}
