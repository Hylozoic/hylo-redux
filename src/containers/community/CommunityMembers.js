import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { debounce } from 'lodash'
import { FETCH_PEOPLE } from '../../actions'
import { fetchPeople } from '../../actions/fetchPeople'
import { cleanAndStringify } from '../../util/caching'
import { isAtBottom } from '../../util/scrolling'
import A from '../../components/A'
import { debug } from '../../util/logging'
import { navigate } from '../../actions'
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

  updateQuery = debounce(opts => {
    let { dispatch, location: { query, pathname } } = this.props
    let newQuery = cleanAndStringify({...query, ...opts})
    let newPath = `${pathname}${newQuery ? '?' + newQuery : ''}`
    dispatch(navigate(newPath))
  }, 500)

  render () {
    let { pending, members, total, location: { query } } = this.props
    let { search } = query
    debug(`members: ${members.length} / ${total || '??'}`)

    return <div className='members'>
      <input type='text' className='form-control search'
        placeholder='Search'
        defaultValue={search}
        onChange={event => this.updateQuery({search: event.target.value})}/>
      {pending && <div className='loading'>Loading...</div>}
      <div className='member-cards'>
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
    </div>
  }
}
