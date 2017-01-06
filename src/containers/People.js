import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { debounce, includes, isEmpty } from 'lodash'
import { get, replace, map } from 'lodash/fp'
import { FETCH_PEOPLE } from '../actions'
import { removeCommunityMember } from '../actions/communities'
import { fetchPeople } from '../actions/fetchPeople'
import { createCacheId, connectedListProps, fetchWithCache, refetch } from '../util/caching'
import Icon from '../components/Icon'
import ScrollListener from '../components/ScrollListener'
import PersonCards from '../components/PersonCards'
import AccessErrorMessage from '../components/AccessErrorMessage'
import A from '../components/A'
const { array, bool, func, number, object, string } = React.PropTypes
import { canInvite, canModerate } from '../models/currentUser'
import { findError } from '../actions/util'
import { sendGraphqlQuery } from '../actions/graphql'
import qs from 'querystring'
import { NonLinkAvatar } from '../components/Avatar'
import { humanDate } from '../util/text'
import { tagUrl, inviteSettingsUrl } from '../routes'
import { SEARCHED, trackEvent } from '../util/analytics'

const subject = 'community'
const fetch = fetchWithCache(fetchPeople)

const fetchPopularSkills = slug =>
  sendGraphqlQuery('popular-skills', slug, `query ($slug: String) {
    community(slug: $slug) { popularSkills(first: 15) }
  }`, {slug})

@prefetch(({ dispatch, params: { id }, query }) => {
  if (!id) id = 'all'
  return Promise.all([
    dispatch(fetch(subject, id, query)),
    id !== 'all' && dispatch(fetchPopularSkills(id))
  ])
})
@connect((state, { params: { id }, location: { query } }) => {
  if (!id) id = 'all'
  const cacheId = createCacheId(subject, id, query)
  return {
    ...connectedListProps(state, {subject, id, query}, 'people'),
    cacheId,
    community: state.communities[id],
    error: findError(state.errors, FETCH_PEOPLE, 'peopleByQuery', cacheId),
    moderatorIds: state.peopleByQuery[qs.stringify({subject: 'community-moderators', id})] || [],
    isMobile: state.isMobile
  }
})
export default class People extends React.Component {
  static propTypes = {
    people: array,
    moderatorIds: array,
    pending: bool,
    dispatch: func,
    total: number,
    params: object,
    location: object,
    community: object,
    error: object,
    isMobile: bool,
    cacheId: string
  }
  static contextTypes = {currentUser: object}

  loadMore = () => {
    let {
      people, dispatch, total, pending, params: { id }, location: { query }
    } = this.props
    if (!id) id = 'all'
    let offset = people.length
    if (!pending && offset < total) {
      dispatch(fetch(subject, id, {...query, offset}))
    }
  }

  trackSearch (prevProps) {
    const { location: { query }, community } = this.props
    if (!query.search) return
    if (prevProps) {
      const prevQuery = prevProps.location.query
      if (prevQuery.search === query.search) return
    }
    trackEvent(SEARCHED, {community, term: query.search, type: 'members'})
  }

  componentDidMount () {
    this.trackSearch()
  }

  componentDidUpdate (prevProps) {
    this.trackSearch(prevProps)
  }

  updateQuery = debounce(opts => {
    let { dispatch, location } = this.props
    dispatch(refetch(opts, location))
  }, 500)

  render () {
    const {
      pending, moderatorIds, location: { query }, community, error,
      total, isMobile, dispatch, cacheId
    } = this.props
    const { currentUser } = this.context
    if (error) return <AccessErrorMessage error={error} />

    // replacing hyphens with non-breaking hyphens
    const popularSkills = map(replace('-', '‑'), get('popularSkills', community))

    const { search } = query
    const { slug } = community || {}
    const people = this.props.people.map(person => ({
      ...person,
      isModerator: includes(moderatorIds, person.id)
    }))

    let removeMember
    if (canModerate(currentUser, community)) {
      removeMember = id => window.confirm('Are you sure you want to remove this member?') && dispatch(removeCommunityMember(community, id, cacheId))
    }

    const searchTag = tag => {
      const search = '#' + tag
      this.updateQuery({search})
      this.refs.searchInput.value = search
    }

    return <div className='members'>
      <div className='search-bar'>
        <Icon name='Loupe' />
        <input type='text'
          ref='searchInput'
          placeholder='Search'
          defaultValue={search}
          onChange={event => this.updateQuery({search: event.target.value})} />
        {search && search.startsWith('#') &&
          <A className='show-posts button'
            to={tagUrl(search.replace(/^#/, ''), slug)}>
            Show tagged posts
          </A>}
      </div>
      {!isEmpty(popularSkills) && <div className='popular-skills'>
        <div className='header'>Popular skills in this community</div>
        <div className='skills'>
          {popularSkills.map(skill => <span key={skill}>
            <a className='skill' onClick={() => searchTag(skill)}>
              #{skill}
            </a>
            &nbsp;<wbr />
          </span>)}
        </div>
      </div>}
      <div className='member-controls'>
        {total} member{total === 1 ? '' : 's'}
        {canInvite(currentUser, community) && <A to={inviteSettingsUrl(community)}>
          Invite members
        </A>}
      </div>
      {pending && <div className='loading'>Loading...</div>}
      {isMobile
        ? people.map(person => <PersonRow person={person} key={person.id} />)
        : <PersonCards people={people} slug={slug} onSkillClick={searchTag} removeMember={removeMember} />}
      <ScrollListener onBottom={this.loadMore} />
    </div>
  }
}

const PersonRow = ({ person }) => {
  const { id, name, joined_at, isModerator } = person
  return <A className='person-row' to={`/u/${id}`}>
    <NonLinkAvatar person={person} />
    <span className='name'>{name}</span>
    <span className='subtitle'>
      {isModerator ? 'Moderator' : 'Member'}
      {joined_at && <span>&nbsp;since {humanDate(joined_at)}</span>}
    </span>
  </A>
}
