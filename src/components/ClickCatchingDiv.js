import React from 'react'
import { navigate } from '../actions'
const { func } = React.PropTypes

const ClickCatchingDiv = (props, { dispatch }) => {
  const handleClick = event => {
    var node = event.target
    if (node.nodeName.toLowerCase() !== 'a') return

    if (node.getAttribute('data-user-id') || node.getAttribute('data-search')) {
      event.preventDefault()
      dispatch(navigate(node.getAttribute('href')))
      return
    }
  }

  return <div {...props} onClick={handleClick}></div>
}

ClickCatchingDiv.contextTypes = {
  dispatch: func.isRequired
}

export default ClickCatchingDiv
