import React from 'react'
import { navigate } from '../actions'
const { func } = React.PropTypes

const ClickCatcher = ({ nodeType, ...props }, { dispatch }) => {
  const handleClick = event => {
    var node = event.target
    if (node.nodeName.toLowerCase() !== 'a') return

    if (node.getAttribute('data-user-id') || node.getAttribute('data-search')) {
      event.preventDefault()
      dispatch(navigate(node.getAttribute('href')))
      return
    }
  }
  switch (nodeType) {
    case 'div':
      return <div {...props} onClick={handleClick}></div>
    case 'span':
      return <span {...props} onClick={handleClick}></span>
  }
}

ClickCatcher.contextTypes = {
  dispatch: func.isRequired
}

export const ClickCatchingDiv = (props, { dispatch }) =>
  <ClickCatcher nodeType='div' {...props}/>

export const ClickCatchingSpan = (props, { dispatch }) =>
  <ClickCatcher nodeType='span' {...props}/>
