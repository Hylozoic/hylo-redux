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
