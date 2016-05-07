import qs from 'querystring'
import { isInCommunity } from './index'
import { compact, includes, omitBy, upperFirst } from 'lodash'
import {
  navigate,
  FETCH_COMMUNITIES,
  FETCH_POSTS,
  FETCH_PEOPLE,
  SEARCH
} from '../actions'

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

export const createCacheId = (subject, id, query = {}) => {
  const { type, tag, sort, search, filter, q } = query
  return cleanAndStringify({subject, id, type, tag, sort, search, filter, q})
}

export const connectedListProps = (state, props, itemType) => {
  let actionType
  let getItem = id => state[itemType][id]

  switch (itemType) {
    case 'posts':
      actionType = FETCH_POSTS
      break
    case 'people':
      actionType = FETCH_PEOPLE
      break
    case 'communities':
      actionType = FETCH_COMMUNITIES
      break
    case 'searchResults':
      actionType = SEARCH
      getItem = x => x
      break

    default:
      throw new Error(`unknown item type: ${itemType}`)
  }

  let { subject, id, query } = props
  let cacheId = createCacheId(subject, id, query)
  let itemKey = `${itemType}ByQuery`
  let itemCountKey = `total${upperFirst(itemType)}ByQuery`
  let hasFreshItemKey = `hasFresh${upperFirst(itemType)}ByQuery`

  let itemIds = compact(state[itemKey][cacheId] || [])
  let hasFreshItems = (state[hasFreshItemKey] || {})[cacheId] || false

  return {
    [itemType]: compact(itemIds.map(getItem)),
    total: state[itemCountKey][cacheId],
    pending: state.pending[actionType],
    stale: hasFreshItems
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

export const paramsForFetch = (location, params, currentUser) => {
  return {
    subject: isInCommunity(location) ? 'community' : 'all-posts',
    id: isInCommunity(location) ? params.id : currentUser.id
  }
}
