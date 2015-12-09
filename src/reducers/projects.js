import { FETCH_PROJECT, FETCH_PROJECTS, UPDATE_PROJECT } from '../actions'
import { hashById } from './util'

export default function (state = {}, action) {
  if (action.error) return state

  let { type, payload, meta } = action
  let { id, params } = meta || {}
  switch (type) {
    case FETCH_PROJECTS:
      return {...state, ...hashById(payload.projects)}
    case FETCH_PROJECT:
      return {...state, [payload.id]: payload}
    case UPDATE_PROJECT:
      return {...state, [id]: {...state[id], ...params}}
  }

  return state
}
