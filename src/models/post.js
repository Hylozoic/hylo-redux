import { assetUrl } from '../util/assets'
import { find, get, intersection, isNull, keys, map, omitBy } from 'lodash'
import { same } from './index'

const fallbackImageUrl = assetUrl('/img/axolotl.jpg')

export const imageUrl = (post, fallback = true) => {
  const url = get(find(post.media, m => m.type === 'image'), 'url')
  return url || (fallback ? fallbackImageUrl : null)
}

export const getCommunities = (post, state) =>
  get(post.communities, '0.id')
    ? post.communities
    : map(post.communities, id => find(state.communities, same('id', {id})))

export const getComments = (post, state) => {
  const { comments, commentsByPost } = state
  const commentIds = get(commentsByPost, post.id)
  return map(commentIds, id => comments[id])
}

export const getEditingPostIds = (posts, state) =>
  intersection(keys(omitBy(state.postEdits, isNull)), posts.map(p => p.id))

export const getPost = (id, state) => id ? get(state.posts, id) : null
