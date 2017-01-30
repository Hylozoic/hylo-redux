import { cleanAndStringify } from '../util/caching'
import {
  CANCEL_TYPEAHEAD,
  TYPEAHEAD
} from '../constants'

export function typeahead (text, id, params) {
  if (!text) return {type: CANCEL_TYPEAHEAD, meta: {id}}

  return {
    type: TYPEAHEAD,
    payload: {
      api: true,
      path: `/noo/autocomplete?${cleanAndStringify({...params, q: text})}`
    },
    meta: {id}
  }
}
