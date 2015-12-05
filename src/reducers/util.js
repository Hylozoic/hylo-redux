import { uniq } from 'lodash'

// for pagination -- append a new page of data to existing data if present,
// removing any duplicates.
export function appendUniq (state, key, data) {
  let existing = state[key] || []
  return {
    ...state,
    [key]: uniq(existing.concat(data), (v, i) => v.id)
  }
}

export function addIdsToState (state, key, objects) {
  return {
    ...state,
    [key]: uniq((state[key] || []).concat(objects.map(p => p.id)))
  }
}

export function hashById (objects, transform) {
  return objects.reduce((m, x) => {
    m[x.id] = transform ? transform(x) : x
    return m
  }, {})
}
