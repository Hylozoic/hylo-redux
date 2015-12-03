import { find } from 'lodash'

const findImage = media => find(media, m => m.type === 'image')

// this looks at the difference in a post's media relations (images and
// other attachments) between when they were last saved and as they are now,
// after possibly being modified in the post editor.
//
// this allows us to conform to the existing API's expectation that we pass
// imageUrl, imageRemoved, docs, and removedDocs parameters, while just
// modifying the media relations array directly on the client side. This
// limits the proliferation of temporary variables on the client side and
// also supports optimistic updating.
export const attachmentParams = (prevMedia, media) => {
  let params = {}
  let prevImage = findImage(prevMedia)
  let image = findImage(media)
  if (image && (!prevImage || image.url !== prevImage.url)) {
    params.imageUrl = image.url
  } else if (prevImage && !image) {
    params.imageRemoved = true
  }
  return params
}
