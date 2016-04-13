import { assetUrl } from '../util/assets'
import { find, get, map } from 'lodash'
import { same } from './index'

const defaultImageUrl = assetUrl('/img/axolotl.jpg')

export const imageUrl = post =>
  get(find(post.media, m => m.type === 'image'), 'url') || defaultImageUrl

export const getCommunities = (post, state) =>
  get(post.communities, '0.id')
    ? post.communities
    : map(post.communities, id => find(state.communities, same('id', {id})))

export const getComments = (post, state) => {
  const { comments, commentsByPost } = state
  const commentIds = get(commentsByPost, post.id)
  return map(commentIds, id => comments[id])
}
