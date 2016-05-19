import React from 'react'
import { navigate } from '../actions'
const { func } = React.PropTypes

const ClickCatcher = ({ tag, ...props }, { dispatch }) => {
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
  switch (tag) {
    case 'div':
      return <div {...props} onClick={handleClick}></div>
    case 'span':
      return <span {...props} onClick={handleClick}></span>
  }
}

ClickCatcher.contextTypes = {
  dispatch: func.isRequired
}

export const ClickCatchingDiv = props => <ClickCatcher tag='div' {...props}/>
export const ClickCatchingSpan = props => <ClickCatcher tag='span' {...props}/>
