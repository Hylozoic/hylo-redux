import qs from 'querystring'
import { capitalize, contains, omit } from 'lodash'
import { FETCH_POSTS } from '../actions'

const commonDefaults = {
  type: ['all+welcome', 'all'],
  sort: 'recent'
}

const blankOrDefault = (defaults = commonDefaults) => (value, key) => {
  let defaultValue = defaults[key]
  return defaultValue === value ||
    (!value && value !== 0) ||
    (Array.isArray(defaultValue) && contains(defaultValue, value))
}

// TODO: sort output by key name
export const cleanAndStringify = (opts, defaults) =>
  qs.stringify(omit(opts, blankOrDefault(defaults)))

export const createCacheId = (subject, id, query = {}) => {
  let { type, sort, search, filter } = query
  let cacheId = cleanAndStringify({subject, id, type, sort, search, filter})
  return cacheId
}

export const connectedListProps = (state, props, itemType) => {
  let actionType
  switch (itemType) {
    case 'posts':
      actionType = FETCH_POSTS
      break
    default:
      throw new Error(`unknown item type: ${itemType}`)
  }

  let { subject, id, query } = props
  let cacheId = createCacheId(subject, id, query)
  let itemKey = `${itemType}ByQuery`
  let itemCountKey = `total${capitalize(itemType)}ByQuery`

  return {
    [itemType]: (state[itemKey][cacheId] || []).map(id => state[itemType][id]),
    total: state[itemCountKey][cacheId],
    pending: state.pending[actionType]
  }
}
