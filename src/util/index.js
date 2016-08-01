import truncate from 'trunc-html'

export const ogMetaTags = (title, description, image) => {
  var metaTags = {
    'og:title': title,
    'og:description': truncate(description || '', 140).text
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

export const isInCommunity = ({ pathname }) => pathname.startsWith('/c/')
