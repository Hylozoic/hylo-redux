import React from 'react'
import { assetUrl } from '../util/assets'

const earthImage = () => assetUrl('/img/earth_1920x1080.jpg')

const CoverImage = ({ url }) =>
  <div id='cover-image'>
    <div className='background' style={{backgroundImage: `url(${url})`}} />
  </div>

const CoverImagePage = ({ id, image, children, showEdit }) => {

  const edit = () => console.log('edit clicked on cober image id', id)

  return <div id={id} className='cover-image-container'>
    <CoverImage url={image || earthImage()} />
    {showEdit && <a className='edit-link' onClick={edit}>Change</a>}
    <div id='cover-image-page-content'>
      {children}
    </div>
  </div>
}

export default CoverImagePage
