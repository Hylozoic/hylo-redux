import { UPDATE_TAG_INVITATION_EDITOR, CLOSE_MODAL, SEND_COMMUNITY_TAG_INVITATION } from '../actions'
import { partition, some } from 'lodash'

const defaultState = {
  recipients: []
}

export default function (state = defaultState, action) {
  let { type, payload, error } = action
  if (error) return state
  switch (type) {
    case UPDATE_TAG_INVITATION_EDITOR:
      return {...state, [payload.field]: payload.value}
    case CLOSE_MODAL:
      return defaultState
    case SEND_COMMUNITY_TAG_INVITATION:
      let { results } = payload
      let [ failures, successes ] = partition(results, r => r.error)
      let success, error
      let sl = successes.length
      if (sl > 0) {
        let pl = sl > 1
        success = `Sent invitation${pl ? 's' : ''} to ${sl} ${pl ? 'people' : 'person'}.`
      }
      if (some(failures)) {
        error = failures.map(r => `Couldn't send to ${r.email}: ${r.error}.`).join(' ')
      }
      return {...state, success, error}
  }
  return state
}
