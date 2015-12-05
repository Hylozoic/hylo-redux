import { FETCH_PROJECTS } from '../actions'
import { hashById } from './util'

export default function (state = {}, action) {
  if (action.error) return state

  let { type, payload } = action
  switch (type) {
    case FETCH_PROJECTS:
      return {...state, ...hashById(payload.projects)}
  }

  return state
}
