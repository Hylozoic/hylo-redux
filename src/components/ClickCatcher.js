import React from 'react'
import { navigate } from '../actions'
import { handleMouseOver } from './Popover'
const { func } = React.PropTypes

const ClickCatcher = ({ tag, ...props }, { dispatch }) => {
  if (!['div', 'span', 'p'].includes(tag)) {
    throw new Error(`invalid tag for ClickCatcher: ${tag}`)
  }

  const handleClick = event => {
    var node = event.target
    if (node.nodeName.toLowerCase() !== 'a') return

    if (node.getAttribute('data-user-id') || node.getAttribute('data-search')) {
      event.preventDefault()
      dispatch(navigate(node.getAttribute('href')))
      return
    }

    if (node.getAttribute('target') !== '_blank') {
      node.setAttribute('target', '_blank')
    }
  }

  return React.createElement(tag, {...props, onClick: handleClick, onMouseOver: handleMouseOver(dispatch)})
}

ClickCatcher.contextTypes = {
  dispatch: func.isRequired
}

export const ClickCatchingP = props => <ClickCatcher tag='p' {...props} />
export const ClickCatchingSpan = props => <ClickCatcher tag='span' {...props} />
