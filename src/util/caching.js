import qs from 'querystring'

export const createCacheId = (opts) => qs.stringify(opts)
