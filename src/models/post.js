import { assetUrl } from '../util/assets'
import { intersection, isNull, keys } from 'lodash'
import { find, get, map, omitBy } from 'lodash/fp'
import { same } from './index'

const fallbackImageUrl = assetUrl('/img/axolotl.jpg')

export const imageUrl = (post, fallback = true) => {
  const url = get('url', find(m => m.type === 'image', post.media))
  return url || (fallback ? fallbackImageUrl : null)
}

export const getCommunities = (post, state) =>
  !post ? []
    : get('0.id', post.communities) ? post.communities
    : map(id => find(same('id', {id}), state.communities), post.communities)

export const getComments = (post, state) => {
  if (!post) return []
  const { comments, commentsByPost } = state
  return map(id => comments[id], get(post.id, commentsByPost))
}

export const getEditingPostIds = (posts, state) =>
  intersection(keys(omitBy(isNull, state.postEdits)), map('id', posts))

export const getPost = (id, state) => id ? get(id, state.posts) : null
