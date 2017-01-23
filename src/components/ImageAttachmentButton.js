import React from 'react'
import Dropdown from './Dropdown'

const ImageAttachmentButton = props => {
  let { pending, add, remove, image } = props

  if (pending) {
    return <button disabled>Please wait...</button>
  }

  if (!image) {
    return <button onClick={add}>Attach Image</button>
  }

  return <Dropdown className='button image-attachment-button' toggleChildren={
    <span>
      <img src={image.url} className='image-thumbnail' />
      Change Image <span className='caret'></span>
    </span>
  }>
    <li><a onClick={remove}>Remove Image</a></li>
    <li><a onClick={add}>Attach Another</a></li>
  </Dropdown>
}

export default ImageAttachmentButton
