import React from 'react'

const earthImage = '/img/earth_1920x1080.jpg'
const spaceRainbowImage = 'http://i.imgur.com/G5WpY72.jpg'

const CoverImage = ({ url }) =>
  <div id='cover-image'>
    <div className='background' style={{backgroundImage: `url(${url})`}}/>
  </div>

const CoverImagePage = ({ id, image, children }) => {
  return <div id={id} className='cover-image-container'>
    <CoverImage url={image || earthImage}/>
    <div id='cover-image-page-content'>
      {children}
    </div>
  </div>
}

export default CoverImagePage
