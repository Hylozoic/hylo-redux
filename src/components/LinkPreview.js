import React from 'react'
import LazyLoader from './LazyLoader'
import { truncate } from '../util/text'

const LinkPreview = ({ linkPreview, onClose }) => {
  const { title, description, image_url, url, image_width } = linkPreview
  const close = event => {
    event.preventDefault()
    onClose(event)
  }
  const imageClassName = image_width < 800 ? 'small' : ''

  return <div className='post-section link-preview-section'>
    <a className='link-preview' href={url} target='_blank'>
      {onClose && <div className='close' onClick={close}>&times;</div>}
      {image_url && <LazyLoader>
        <img src={image_url} className={imageClassName}/>
      </LazyLoader>}
      <span className='link-preview-title'>{title}</span>
      {description && <span className='link-preview-description'>{truncate(description, 300)}</span>}
    </a>
  </div>
}

export default LinkPreview
