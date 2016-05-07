import { same } from '../models'
import { filter, find } from 'lodash/fp'
import { includes } from 'lodash'

const isType = type => x => x.type === type

// this looks at the difference in a post's media relations (images and other
// attachments) between when they were last saved and as they are now, after
// possibly being modified in the post editor.
//
// this allows us to conform to the existing API's expectation that we pass
// imageUrl, imageRemoved, docs, and removedDocs parameters, while just
// modifying the media relations array directly on the client side. This limits
// the proliferation of temporary variables on the client side and also supports
// optimistic updating.
export const attachmentParams = (prevMedia, media) => {
  const params = {}

  const prevImage = find(isType('image'), prevMedia)
  const image = find(isType('image'), media)
  if (image && (!prevImage || !same('url', image, prevImage))) {
    params.imageUrl = image.url
  } else if (prevImage && !image) {
    params.imageRemoved = true
  }

  const prevVideo = find(isType('video'), prevMedia)
  const video = find(isType('video'), media)
  if (video && (!prevVideo || !same('url', video, prevVideo))) {
    params.videoUrl = video.url
  } else {
    params.videoRemoved = true
  }

  const prevDocs = filter(isType('gdoc'), prevMedia)
  const docs = filter(isType('gdoc'), media)
  const urls = docs.map(d => d.url)

  params.docs = docs
  params.removedDocs = filter(prevDocs, d => !includes(urls, d.url))

  return params
}
