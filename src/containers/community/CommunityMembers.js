import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { fetchPeople, FETCH_PEOPLE } from '../../actions/fetchPeople'
import { cleanAndStringify } from '../../util/caching'
import A from '../../components/A'
const { array, bool } = React.PropTypes

const subject = 'community'

const createCacheId = (subject, id, query = {}) => {
  let { search } = query
  return cleanAndStringify({subject, id, search})
}

const CommunityMembers = props => {
  let { pending, members } = props
  return <div>
    <ul>
      {pending && <li className='loading'>Loading...</li>}
      {members.map(person => <li key={person.id}>
        <A to={`/u/${person.id}`}>{person.name}</A>
      </li>)}
    </ul>
  </div>
}

CommunityMembers.PropTypes = {
  members: array,
  pending: bool
}

export default compose(
  prefetch(({ dispatch, params: { id }, query }) => {
    let cacheId = createCacheId(subject, id, query)
    return dispatch(fetchPeople({subject, id, cacheId, limit: 20, ...query}))
  }),
  connect(({ people, peopleByQuery, totalPeopleByQuery, pending }, { params, location }) => {
    let cacheId = createCacheId(subject, params.id, location.query)
    return {
      members: (peopleByQuery[cacheId] || []).map(id => people[id]),
      total: totalPeopleByQuery[cacheId],
      pending: pending[FETCH_PEOPLE]
    }
  })
)(CommunityMembers)
