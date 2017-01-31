import {
  SHOW_MODAL,
  CLOSE_MODAL
} from './constants'

export function showModal (name, payload) {
  return {type: SHOW_MODAL, payload, meta: {name}}
}

export function closeModal () {
  return {type: CLOSE_MODAL}
}
