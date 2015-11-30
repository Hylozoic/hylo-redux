import qs from 'querystring'
import { contains, omit } from 'lodash'

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
