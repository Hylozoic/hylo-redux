import React from 'react'
import { assetUrl } from '../util/assets'
import ChangeImageButton from './ChangeImageButton'

const earthImage = () => assetUrl('/img/earth_1920x1080.jpg')

const CoverImage = ({ url }) =>
  <div id='cover-image'>
    <div className='background' style={{backgroundImage: `url(${url})`}} />
  </div>

const CoverImagePage = ({ id, image, children, person, community }) => {
  return <div id={id} className='cover-image-container'>
    <CoverImage url={image || earthImage()} />
    {(person || community) && <ChangeImageButton person={person} community={community} type='banner_url' />}
    <div id='cover-image-page-content'>
      {children}
    </div>
  </div>
}

export default CoverImagePage
