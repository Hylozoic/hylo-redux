import {
  LOGIN, SIGNUP, FETCH_CURRENT_USER, SET_UNSEEN_THREAD_COUNT,
  INCREMENT_UNSEEN_THREADS, UPDATE_USER_SETTINGS_PENDING
} from '../actions'
import { get } from 'lodash/fp'

const newMessageCount = (state = 0, action) => {
  const { type, error, payload } = action
  if (error) return state
  switch (type) {
    case LOGIN:
    case SIGNUP:
    case FETCH_CURRENT_USER:
      return get('new_message_count', payload) || state
    case SET_UNSEEN_THREAD_COUNT:
      return payload.count
    case INCREMENT_UNSEEN_THREADS:
      return state + 1
    case UPDATE_USER_SETTINGS_PENDING:
      if (get('params.settings.last_viewed_messages_at', action.meta)) {
        return 0
      }
  }
  return state
}

export default newMessageCount
