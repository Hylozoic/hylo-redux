import React from 'react'

const CoverImage = ({ url }) =>
  <div id='cover-image'>
    <div className='background' style={{backgroundImage: `url(${url})`}}/>
  </div>

const CoverImagePage = ({ id, image, children }) => {
  return <div id={id} className='cover-image-container'>
    <CoverImage url={image}/>
    <div id='cover-image-page-content'>
      {children}
    </div>
  </div>
}

export default CoverImagePage
