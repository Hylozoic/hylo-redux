import { get } from 'lodash/fp'
import { 
  APPEND_THREAD,
  FIND_OR_CREATE_THREAD,
  ON_THREAD_PAGE,
  OFF_THREAD_PAGE,
  UPDATE_MESSAGE_EDITOR
} from './index'

export function appendThread (thread) {
  return {
    type: APPEND_THREAD,
    payload: thread,
    meta: {
      addDataToStore: {
        people: get('people')
      }
    }
  }
}

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

export function onThreadPage (id) {
  return {
    type: ON_THREAD_PAGE,
    payload: {id}
  }
}

export function offThreadPage () {
  return {
    type: OFF_THREAD_PAGE
  }
}

export function updateMessageEditor (id, text) {
  return {
    type: UPDATE_MESSAGE_EDITOR,
    payload: {id, text}
  }
}
