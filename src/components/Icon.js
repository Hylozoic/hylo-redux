import React from 'react'

const Icon = ({ name }) => {
  // TODO support non-glyphicon icons with switch(name)
  return <i className={`icon glyphicon glyphicon-${name}`}></i>
}

export default Icon
