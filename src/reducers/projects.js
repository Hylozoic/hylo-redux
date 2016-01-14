import { FETCH_PROJECT, FETCH_PROJECTS, UPDATE_PROJECT, JOIN_PROJECT, JOIN_PROJECT_PENDING } from '../actions'
import { hashById } from './util'

export default function (state = {}, action) {
  let { type, payload, meta, error } = action

  if (error) {
    switch (type) {
      case JOIN_PROJECT:
        return {...state, [meta.id]: meta.prevProps}
    }

    return state
  }

  let { id, params, currentUser } = meta || {}
  switch (type) {
    case FETCH_PROJECTS:
      return {...state, ...hashById(payload.projects)}
    case FETCH_PROJECT:
      return {...state, [payload.id]: payload}
    case UPDATE_PROJECT:
      if (params.publish || params.unpublish) {
        let { published_at } = payload
        return {...state, [id]: {...state[id], published_at}}
      }
      return {...state, [id]: {...state[id], ...params}}
    case JOIN_PROJECT_PENDING:
      var contributors
      if (currentUser) {
        contributors = [...state[id].contributors, currentUser]
      } else {
        contributors = state[id].contributors
      }
      return {...state, [id]: {...state[id], contributors}}
  }

  return state
}
