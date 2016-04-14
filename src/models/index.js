import { curry, get } from 'lodash'

export const same = curry((path, o1, o2) => get(o1, path) === get(o2, path))
export const not = fn => (...args) => !fn(...args)
export const truthy = fn => (...args) => !!fn(...args)
