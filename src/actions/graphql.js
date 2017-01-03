import { mapValues, get, flow } from 'lodash/fp'
import { SEND_GRAPHQL_QUERY } from './index'

export function sendGraphqlQuery (subject, id, query, addDataToStore) {
  return {
    type: SEND_GRAPHQL_QUERY,
    payload: {api: true, path: '/noo/graphql', params: {query}, method: 'POST'},
    meta: {subject, id, addDataToStore} // these are provided so reducers know what to do
  }
}

export const sendGraphqlQueryAddDataToStore = (id, query, addDataToStore) =>
  sendGraphqlQuery('add-data-to-store', id, query,
    mapValues(fn => flow(get('data'), fn), addDataToStore))
