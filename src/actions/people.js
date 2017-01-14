import { FETCH_PERSON } from './index'
import { get } from 'lodash/fp'

export function fetchPerson (id) {
  return {
    type: FETCH_PERSON,
    payload: {api: true, path: `/noo/user/${id}`},
    meta: {
      cache: {bucket: 'people', id, requiredProp: 'grouped_post_count'},
      addDataToStore: {
        people: get('people'),
        communities: get('communities')
      }
    }
  }
}
