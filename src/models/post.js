import { assetUrl } from '../util/assets'
import { find, get } from 'lodash'

const defaultImageUrl = assetUrl('/img/axolotl.jpg')

export const imageUrl = post =>
  get(find(post.media, m => m.type === 'image'), 'url') || defaultImageUrl
