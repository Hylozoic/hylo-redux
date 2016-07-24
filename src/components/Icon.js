import React from 'react'

const Icon = ({ name, glyphicon }) => {
  const className = glyphicon
    ? `icon glyphicon glyphicon-${name}`
    : `icon icon-${name}`

  return <span className={className}></span>
}

export default Icon
