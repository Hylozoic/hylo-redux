import { SEND_GRAPHQL_QUERY } from './index'

export function sendGraphqlQuery (subject, id, query) {
  return {
    type: SEND_GRAPHQL_QUERY,
    payload: {api: true, path: '/noo/graphql', params: {query}, method: 'POST'},
    meta: {subject, id} // these are provided so reducers know what to do
  }
}
