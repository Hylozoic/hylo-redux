import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { fetchPeople, FETCH_PEOPLE } from '../../actions/fetchPeople'
import { cleanAndStringify } from '../../util/caching'
import { isAtBottom } from '../../util/scrolling'
import A from '../../components/A'
import { debug } from '../../util/logging'
const { array, bool, func, number, object } = React.PropTypes

const subject = 'community'

const createCacheId = (subject, id, query = {}) => {
  let { search } = query
  return cleanAndStringify({subject, id, search})
}

const fetch = (id, query) => {
  let cacheId = createCacheId(subject, id, query)
  return fetchPeople({subject, id, cacheId, limit: 20, ...query})
}

@prefetch(({ dispatch, params: { id }, query }) => dispatch(fetch(id, query)))
@connect(({ people, peopleByQuery, totalPeopleByQuery, pending }, { params, location }) => {
  let cacheId = createCacheId(subject, params.id, location.query)
  return {
    members: (peopleByQuery[cacheId] || []).map(id => people[id]),
    total: totalPeopleByQuery[cacheId],
    pending: pending[FETCH_PEOPLE]
  }
})
export default class CommunityMembers extends React.Component {
  static propTypes = {
    members: array,
    pending: bool,
    dispatch: func,
    total: number,
    params: object,
    location: object
  }

  componentDidMount () {
    window.addEventListener('scroll', this.handleScrollEvents)
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this.handleScrollEvents)
  }

  handleScrollEvents = event => {
    event.preventDefault()
    if (isAtBottom(250)) this.loadMore()
  }

  loadMore = () => {
    let { members, dispatch, total, pending, params, location } = this.props
    if (total && members.length >= total || pending) return

    let offset = members.length
    dispatch(fetch(params.id, {...location.query, offset}))
  }

  render () {
    let { pending, members, total } = this.props
    debug(`members: ${members.length} / ${total || '??'}`)
    return <div className='members'>
      {pending && <li className='loading'>Loading...</li>}
      {members.map(person => <div key={person.id} className='member'>
        <div key={person.id} className='member-card'>
          <A to={`/u/${person.id}`}>
            <div className='large-avatar' style={{backgroundImage: `url(${person.avatar_url})`}}/>
          </A>
          <br/>
          <A className='name' to={`/u/${person.id}`}>{person.name}</A>
        </div>
      </div>)}
    </div>
  }
}
