import React from 'react'

const Icon = ({ name, glyphicon }) => {
  let className = glyphicon
  ? `icon glyphicon glyphicon-${name}`
  : className = `icon icon-${name}`

  return <span className={className}></span>
}

export default Icon
