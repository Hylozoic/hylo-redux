import { contains, filter, find } from 'lodash'

const findImage = media => find(media, m => m.type === 'image')
const filterDocs = media => filter(media, m => m.type === 'gdoc')

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

  let prevDocs = filterDocs(prevMedia)
  let docs = filterDocs(media)
  let urls = docs.map(d => d.url)

  params.docs = docs
  params.removedDocs = filter(prevDocs, d => !contains(urls, d.url))

  return params
}
