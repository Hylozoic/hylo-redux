import { mapValues, get, flow } from 'lodash/fp'
import { SEND_GRAPHQL_QUERY } from './index'

export function sendGraphqlQuery (query, opts) {
  const { variables, addDataToStore, subject, id } = opts
  return {
    type: SEND_GRAPHQL_QUERY,
    payload: {
      api: true,
      path: '/noo/graphql',
      params: {query, variables},
      method: 'POST'
    },
    meta: {subject, id, addDataToStore} // these are provided so reducers know what to do
  }
}
