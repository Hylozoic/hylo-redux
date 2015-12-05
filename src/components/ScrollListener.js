import React from 'react'
import { throttle } from 'lodash'
import { isAtBottom } from '../util/scrolling'
const { func } = React.PropTypes

export default class ScrollListener extends React.Component {
  static propTypes = {
    onBottom: func
  }

  handleScrollEvents = throttle(event => {
    event.preventDefault()
    let { onBottom } = this.props
    if (onBottom && isAtBottom(250)) onBottom()
  }, 50)

  componentDidMount () {
    window.addEventListener('scroll', this.handleScrollEvents)
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this.handleScrollEvents)
  }

  render () {
    return <span></span>
  }
}
