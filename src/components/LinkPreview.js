import React from 'react'

const LinkPreview = ({ linkPreview }) => {
  const { title, description, image_url } = linkPreview
  return <div className='link-preview'>
    <img src={image_url}/>
    <span className='link-preview-title'>{title}</span>
    <span className='link-preview-description'>{description}</span>
  </div>
}

export default LinkPreview
