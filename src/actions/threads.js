import { get } from 'lodash/fp'
import { 
  FIND_OR_CREATE_THREAD,
  UPDATE_MESSAGE_EDITOR
} from './index'

export function findOrCreateThread (messageTo) {
  return {
    type: FIND_OR_CREATE_THREAD,
    payload: {api: true, params: { messageTo }, path: '/noo/thread', method: 'POST'},
    meta: {
      messageTo,
      addDataToStore: {
        communities: get('communities'),
        people: get('followers')
      }
    }
  }
}

export function updateMessageEditor (id, text) {
  return {
    type: UPDATE_MESSAGE_EDITOR,
    payload: {id, text}
  }
}
