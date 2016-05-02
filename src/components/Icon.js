import React from 'react'

const Icon = ({ name }) => {
  let className
  switch (name) {
    case 'facebook':
    case 'linkedin':
    case 'twitter':
      className = `icon icon-${name}`
      break
    default:
      className = `icon glyphicon glyphicon-${name}`
  }
  return <i className={className}></i>
}

export default Icon
