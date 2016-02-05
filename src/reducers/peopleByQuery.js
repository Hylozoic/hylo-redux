import {
  FETCH_PEOPLE,
  FETCH_PROJECT,
  REMOVE_PROJECT_CONTRIBUTOR,
  TOGGLE_PROJECT_MODERATOR_ROLE
} from '../actions'
import { compose, filter, get, partialRight, uniq, without } from 'lodash'
import qs from 'querystring'
import { MemberRole } from '../models/project'

const moderatorKey = id => qs.stringify({subject: 'project-moderators', id})

const contributorKey = id => qs.stringify({subject: 'project', id})

const addPeople = (state, key, ...userIds) => {
  return {
    ...state,
    [key]: [...(state[key] || []), ...userIds]
  }
}

const removePerson = (state, key, userId) => {
  return {
    ...state,
    [key]: without(state[key], userId)
  }
}

const handlePeople = (state, key, people) => {
  let newState = {
    ...state,
    [key]: uniq((state[key] || []).concat(people.map(p => p.id)))
  }

  // extract project moderators and save them separately
  let { subject, id } = qs.parse(key)
  if (subject === 'project') {
    let isModerator = p => get(p, 'membership.role') === MemberRole.MODERATOR
    let moderatorIds = filter(people, isModerator).map(p => p.id)
    return addPeople(newState, moderatorKey(id), ...moderatorIds)
  }

  return newState
}

export default function (state = {}, action) {
  if (action.error) return state

  let { type, payload, meta } = action
  let { projectId, userId, role } = meta || {}
  switch (type) {
    case FETCH_PEOPLE:
      let { cache } = meta
      return handlePeople(state, cache.id, payload.people)
    case FETCH_PROJECT:
      if (get(payload, 'membership.role') === MemberRole.MODERATOR) {
        let key = qs.stringify({subject: 'project-moderators', id: payload.id})
        return {
          ...state,
          [key]: [...(state[key] || []), get(payload, 'membership.user_id')]
        }
      }
      break
    case TOGGLE_PROJECT_MODERATOR_ROLE:
      if (role === MemberRole.MODERATOR) {
        return addPeople(state, moderatorKey(projectId), userId)
      } else {
        return removePerson(state, moderatorKey(projectId), userId)
      }
      break
    case REMOVE_PROJECT_CONTRIBUTOR:
      return compose(
        partialRight(removePerson, contributorKey(projectId), userId),
        partialRight(removePerson, moderatorKey(projectId), userId)
      )(state)

  }
  return state
}
