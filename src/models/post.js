import { assetUrl } from '../util/assets'
import { compact, intersection, isNull, keys } from 'lodash'
import { curry, find, get, map, omitBy } from 'lodash/fp'
import { same } from './index'
import { getPerson } from './person'
import { getCommunity } from './community'

const fallbackImageUrl = () => assetUrl('/img/axolotl.jpg')

const media = curry((type, post) => find(m => m.type === type, post.media))
export const getVideo = media('video')
export const getImage = media('image')

export const imageUrl = (post, fallback = true) =>
  get('thumbnail_url', getVideo(post)) || get('url', getImage(post)) ||
    (fallback && fallbackImageUrl()) || null

export const getCommunities = (post, state) =>
  !post ? []
    : get('0.id', post.communities) ? post.communities
    : compact(map(
        id => find(same('id', {id}), state.communities),
        post.communities || post.community_ids))

export const getComments = (post, state) => {
  if (!post) return []
  const { comments, commentsByPost } = state
  return compact(map(id => comments[id], get(post.id, commentsByPost)))
}

export const getEditingPostIds = (posts, state) =>
  intersection(keys(omitBy(isNull, state.postEdits)), map('id', posts))

export const getPost = (id, state) => id ? get(id, state.posts) : null

export const isPinned = (post, community) =>
 community ? get(['memberships', community.slug, 'pinned'], post) : null

export const denormalizedPost = (post, state) => ({
  ...post,
  user: getPerson(post.user_id, state),
  followers: map(id => getPerson(id, state), post.follower_ids),
  communities: map(id => getCommunity(id, state), post.community_ids)
})
