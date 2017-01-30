import {
  ADD_DATA_TO_STORE,
  FETCH_PEOPLE,
  REMOVE_COMMUNITY_MEMBER_PENDING
} from '../constants'
import { concatKeyedArrays } from './util'
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
  let { type, payload, meta } = action

  switch (type) {
    case ADD_DATA_TO_STORE:
      if (meta.bucket === 'peopleByQuery') {
        return concatKeyedArrays(state, payload)
      }
      break
    case FETCH_PEOPLE:
      let { cache } = meta
      return handlePeople(state, cache.id, payload.items)
    case REMOVE_COMMUNITY_MEMBER_PENDING:
      let { cacheId } = meta
      return {
        ...state,
        [cacheId]: filter(state[cacheId], id => id !== meta.userId)
      }
  }
  return state
}
