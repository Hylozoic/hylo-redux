import { FETCH_PEOPLE } from '../actions'
import { filter, get, uniq } from 'lodash'
import qs from 'querystring'
import { ProjectMemberRole } from '../constants'

const handlePeople = (state, key, people) => {
  let newState = {
    ...state,
    [key]: uniq((state[key] || []).concat(people.map(p => p.id)))
  }

  // extract project moderators and save them separately
  let { subject, id } = qs.parse(key)
  if (subject === 'project') {
    let moderatorKey = qs.stringify({subject: 'project-moderators', id})
    let isModerator = p => get(p, 'membership.role') === ProjectMemberRole.MODERATOR
    let moderatorIds = filter(people, isModerator).map(p => p.id)

    newState[moderatorKey] = [...(state[moderatorKey] || []), ...moderatorIds]
  }

  return newState
}

export default function (state = {}, action) {
  if (action.error) return state

  let { type, payload, meta } = action
  switch (type) {
    case FETCH_PEOPLE:
      let { cache } = meta
      return handlePeople(state, cache.id, payload.people)
  }
  return state
}
