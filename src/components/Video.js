// adapted from https://github.com/andoulla/angular-video

import React from 'react'
import cx from 'classnames'
import { parse, format } from 'url'

export const youtubeParams = '?autoplay=0&showinfo=0&controls=0'

// Produce an embeddable url
// for youtube: src="//www.youtube.com/embed/{{video_id}}"
// for vimeo: src="//player.vimeo.com/video/{{video_id}}
export function convert (url) {
  let u = parse(url, true)
  delete u.protocol

  switch (u.host) {
    case 'vimeo.com':
      delete u.query
      delete u.search
      u.host = 'player.vimeo.com'
      u.pathname = `/video${u.pathname}`
      break
    case 'youtu.be':
      u.search = youtubeParams
      u.host = 'www.youtube.com'
      u.pathname = `/embed${u.pathname}`
      break
    case 'youtube.com':
    case 'www.youtube.com':
      u.search = youtubeParams
      u.host = 'www.youtube.com'
      u.pathname = `/embed/${u.query.v}`
      break
  }
  return format(u)
}

const Video = props => {
  let { url, width, height, className } = props
  return <iframe className={cx('video', className)}
    type='text/html'
    width={width} height={height}
    src={convert(url)}
    allowFullScreen
    frameBorder='0'/>
}

export default Video
