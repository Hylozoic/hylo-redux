import { get, isUndefined, omitBy, values } from 'lodash/fp'
import { mergeWith } from 'lodash'

export const invalidCharacterRegex = /[^\w\-]/
export const hashtagCharacterRegex = /^[\w\-]$/
export const hashtagWordRegex = /^[A-Za-z][\w\-]+$/
export const hashtagFullRegex = /^#([A-Za-z][\w\-]+)$/

export const aggregatedTags = ({ tagsByCommunity }) =>
  mergeWith({}, ...values(tagsByCommunity), (v1, v0, k) =>
    omitBy(isUndefined, {
      ...v0,
      post: get('post', v0) || get('post', v1),
      followed: get('followed', v0) || get('followed', v1),
      new_post_count: (get('new_post_count', v0) || 0) + (get('new_post_count', v1) || 0)
    }))
