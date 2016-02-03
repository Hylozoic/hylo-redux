import truncate from 'html-truncate'
import striptags from 'striptags'

export const ogMetaTags = (title, description, image) => {
  var metaTags = {
    'og:title': title,
    'og:description': truncate(striptags(description || ''), 140)
  }
  if (image) {
    metaTags = {...metaTags,
      'og:image': image.url,
      'og:image:width': image.width,
      'og:image:height': image.height
    }
  }
  return metaTags
}
