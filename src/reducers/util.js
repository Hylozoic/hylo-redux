import {
  cloneDeep, filter, isArray, isEqual, mergeWith, set, some, transform, uniq
} from 'lodash'

export const appendUniq = (state, key, values) =>
  concatUniq(state, key, state[key] || [], values)

export const prependUniq = (state, key, values) =>
  concatUniq(state, key, values, state[key] || [])

export const concatUniq = (state, key, first, second) => ({
  ...state,
  [key]: uniq(first.concat(second))
})

// given a list of items, produce an object where each item is keyed by the
// value of the iteratee (lodash's term for a function to apply or a property
// name to look up) for it
export const hashBy = (arr, iteratee) => {
  let fn = typeof iteratee === 'function'
    ? (r, n) => r[iteratee(n)] = n
    : (r, n) => r[n[iteratee]] = n
  return transform(arr, fn, {})
}

// for modifying a post or other object with a list of media; set an item of
// specified type if url is set, and remove it otherwise. assumes that there is
// can be only one item of specified type, so it should be used with images and
// videos in the current implementation but not docs.
export function updateMedia (obj, type, url) {
  let media = filter(obj && obj.media, m => m.type !== type)
  if (url) media = media.concat({type, url})
  return {...obj, media}
}

// update state with a set of items. items that already exist in the state get
// new properties, update the values of existing properties, and do not lose any
// existing properties that aren't contained in their new counterpart.
export const mergeList = (state, items, key) => {
  let mergedItems = items.reduce((m, x) => {
    const id = x[key]
    m[id] = mergeWith({...state[id]}, x, (objValue, srcValue) => {
      // we don't want to perform the default behavior of merge when working
      // with arrays, because that concatenates them. e.g. with the list of
      // media for a post, that creates duplicate values. so we replace the old
      // value with the new one instead.
      if (isArray(objValue) && isArray(srcValue)) return srcValue
    })
    return m
  }, {})

  return {...state, ...mergedItems}
}

export const cloneSet = (state, path, value) => {
  let newState = cloneDeep(state)
  set(newState, path, value)
  return newState
}

export const toggleIncludes = (arr, element) => {
  return some(arr, x => isEqual(x, element))
    ? filter(arr, x => !isEqual(x, element))
    : [...arr, element]
}
