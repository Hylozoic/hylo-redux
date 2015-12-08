// adapted from https://github.com/andoulla/angular-video

import React from 'react'
import cx from 'classnames'

const youtubeParams = '?autoplay=0&showinfo=0&controls=0'

// Produce an embeddable url
// for youtube: src="//www.youtube.com/embed/{{video_id}}"
// for vimeo: src="http://player.vimeo.com/video/{{video_id}}
function convert (url) {
  let newUrl

  if (url.indexOf('vimeo') >= 0) { // Displaying a vimeo video
    if (url.indexOf('player.vimeo') >= 0) {
      newUrl = url
    } else {
      newUrl = url.replace(/https?:/, '')
      let urlSections = newUrl.split('.com/')
      newUrl = newUrl.replace('vimeo', 'player.vimeo')
      newUrl = newUrl.replace('/' + urlSections[urlSections.length - 1], '/video/' + urlSections[urlSections.length - 1] + '')
    }
  } else if (url.indexOf('youtu.be') >= 0) {
    let index = url.indexOf('.be/')

    newUrl = url.slice(index + 4, url.length)
    newUrl = 'http://www.youtube.com/embed/' + newUrl + youtubeParams
  } else if (url.indexOf('youtube.com') >= 0) { // displaying a youtube video
    if (url.indexOf('embed') >= 0) {
      newUrl = url
    } else {
      newUrl = url.replace('/watch?v=', '/embed/')
    }

    newUrl += youtubeParams
  }

  return newUrl
}

const Video = props => {
  let { url, width, height, className } = props
  return <iframe className={cx('videoClass', className)}
    type='text/html'
    width={width} height={height}
    src={convert(url)}
    allowFullScreen
    frameBorder='0'/>
}

export default Video
