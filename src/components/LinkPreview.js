import React from 'react'

const LinkPreview = ({ linkPreview, onClose }) => {
  const { title, description, image_url, url, image_width } = linkPreview
  const close = event => {
    event.preventDefault()
    onClose(event)
  }

  return <div className='post-section link-preview-section'>
    <a className='link-preview' href={url} target='_blank'>
      {onClose && <div className='close' onClick={close}>&times;</div>}
      <img src={image_url} className={image_width < 800 ? 'small' : ''}/>
      <span className='link-preview-title'>{title}</span>
      <span className='link-preview-description'>{description}</span>
    </a>
  </div>
}

export default LinkPreview
