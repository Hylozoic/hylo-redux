import React from 'react'

const Icon = ({ name, glyphicon, onClick }) => {
  const className = glyphicon
    ? `icon glyphicon glyphicon-${name}`
    : `icon icon-${name}`

  return <span {...{className, onClick}}></span>
}

export default Icon
