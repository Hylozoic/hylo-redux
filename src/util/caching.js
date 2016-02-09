import qs from 'querystring'
import { capitalize, includes, omitBy } from 'lodash'
import { navigate, FETCH_POSTS, FETCH_PROJECTS, FETCH_PEOPLE } from '../actions'

const commonDefaults = {
  type: ['all+welcome', 'all'],
  sort: 'recent'
}

const blankOrDefault = (defaults = commonDefaults) => (value, key) => {
  let defaultValue = defaults[key]
  return defaultValue === value ||
    (!value && value !== 0) ||
    (Array.isArray(defaultValue) && includes(defaultValue, value))
}

// TODO: sort output by key name
export const cleanAndStringify = (opts, defaults) =>
  qs.stringify(omitBy(opts, blankOrDefault(defaults)))

const createCacheId = (subject, id, query = {}) => {
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
    case 'projects':
      actionType = FETCH_PROJECTS
      break
    case 'people':
      actionType = FETCH_PEOPLE
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

export const fetchWithCache = action => (subject, id, query = {}) => {
  let cacheId = createCacheId(subject, id, query)
  return action({subject, id, limit: 20, ...query, cacheId})
}

export const refetch = (opts, location, defaults) => {
  let { query, pathname } = location
  let newQuery = cleanAndStringify({...query, ...opts}, defaults)
  let newPath = `${pathname}${newQuery ? '?' + newQuery : ''}`
  return navigate(newPath)
}
