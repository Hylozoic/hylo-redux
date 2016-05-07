import {
  FETCH_PEOPLE
} from '../actions'
import { filter, uniq } from 'lodash'
import qs from 'querystring'

const communityModeratorKey = id => qs.stringify({subject: 'community-moderators', id})

const addPeople = (state, key, ...userIds) => {
  return {
    ...state,
    [key]: [...(state[key] || []), ...userIds]
  }
}

const handlePeople = (state, key, people) => {
  let newState = {
    ...state,
    [key]: uniq((state[key] || []).concat(people.map(p => p.id)))
  }

  // extract community moderators and save them separately
  let { subject, id } = qs.parse(key)
  if (subject === 'community') {
    let isModerator = p => p.isModerator
    let moderatorIds = filter(people, isModerator).map(p => p.id)
    return addPeople(newState, communityModeratorKey(id), ...moderatorIds)
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
