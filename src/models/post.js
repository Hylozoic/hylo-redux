import { assetUrl } from '../util/assets'
import { intersection, isNull, keys } from 'lodash'
import { curry, find, get, map, omitBy } from 'lodash/fp'
import { same } from './index'

const fallbackImageUrl = assetUrl('/img/axolotl.jpg')

const media = curry((type, post) => find(m => m.type === type, post.media))
export const getVideo = media('video')
export const getImage = media('image')

export const imageUrl = (post, fallback = true) =>
  get('thumbnail_url', getVideo(post)) || get('url', getImage(post)) ||
    (fallback && fallbackImageUrl) || null

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
