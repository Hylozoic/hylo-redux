import React from 'react'
import { throttle } from 'lodash'
import { isAtBottom } from '../util/scrolling'
const { func, string } = React.PropTypes

export default class ScrollListener extends React.Component {
  static propTypes = {
    onBottom: func.isRequired,
    elementId: string
  }

  handleScrollEvents = throttle(event => {
    event.preventDefault()
    const { onBottom } = this.props
    if (onBottom && isAtBottom(250, this.element())) onBottom()
  }, 100)

  element () {
    const { elementId } = this.props
    return elementId ? document.getElementById(elementId) : window
  }

  componentDidMount () {
    this.element().addEventListener('scroll', this.handleScrollEvents)
  }

  componentWillUnmount () {
    this.element().removeEventListener('scroll', this.handleScrollEvents)
  }

  render () {
    return null
  }
}
