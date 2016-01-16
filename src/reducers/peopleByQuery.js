import { FETCH_PEOPLE, FETCH_PROJECT, TOGGLE_PROJECT_MODERATOR_ROLE } from '../actions'
import { filter, get, uniq, without } from 'lodash'
import qs from 'querystring'
import { ProjectMemberRole } from '../constants'

const moderatorKey = id => {
  return qs.stringify({subject: 'project-moderators', id})
}

const addModerators = (state, projectId, ...userIds) => {
  let key = moderatorKey(projectId)
  return {
    ...state,
    [key]: [...(state[key] || []), ...userIds]
  }
}

const removeModerator = (state, projectId, userId) => {
  let key = moderatorKey(projectId)
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
    let isModerator = p => get(p, 'membership.role') === ProjectMemberRole.MODERATOR
    let moderatorIds = filter(people, isModerator).map(p => p.id)
    return addModerators(newState, id, ...moderatorIds)
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
    case FETCH_PROJECT:
      if (get(payload, 'membership.role') === ProjectMemberRole.MODERATOR) {
        let key = qs.stringify({subject: 'project-moderators', id: payload.id})
        return {
          ...state,
          [key]: [...(state[key] || []), get(payload, 'membership.user_id')]
        }
      }
      break
    case TOGGLE_PROJECT_MODERATOR_ROLE:
      let { projectId, userId, role } = meta
      if (role === ProjectMemberRole.MODERATOR) {
        return addModerators(state, projectId, userId)
      } else {
        return removeModerator(state, projectId, userId)
      }
  }
  return state
}
