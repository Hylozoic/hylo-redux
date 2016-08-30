import React from 'react'

const Icon = ({ name, glyphicon, onClick }) => {
  const className = glyphicon
    ? `icon glyphicon glyphicon-${name}`
    : `icon icon-${name}`

  return <span {...{className, onClick}}></span>
}

export const IconGoogleDrive = () => <span className='icon icon-Google-Drive'>
  <span className='path1'></span><span className='path2'></span><span className='path3'></span>
</span>

export default Icon
