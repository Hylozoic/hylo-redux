import React from 'react'
import { connect } from 'react-redux'
import cx from 'classnames'
import { tagUrlComponents } from '../routes'
import { position } from '../util/scrolling'
import { showPopover, hidePopover } from '../actions/index'
import TagPopover from './TagPopover'
import PersonPopover from './PersonPopover'
const { string, object, func } = React.PropTypes

let canceledPopover

export const handleMouseOver = dispatch => event => {
  const node = event.target

  const isTag = node.getAttribute('class') === 'hashtag'
  const userId = node.getAttribute('data-user-id')

  if (node.nodeName.toLowerCase() === 'a' && (isTag || userId)) {
    canceledPopover = false

    const hide = () =>
      dispatch(hidePopover())

    const cancel = () => {
      canceledPopover = true
      node.removeEventListener('mouseleave', cancel)
      node.removeEventListener('click', hide)
    }
    node.addEventListener('mouseleave', cancel)
    node.addEventListener('click', hide)

    setTimeout(() => {
      if (canceledPopover) return
      if (isTag) {
        const { tagName, slug } = tagUrlComponents(node.getAttribute('href'))
        dispatch(showPopover('tag', {tagName, slug}, node))
      } else {
        dispatch(showPopover('person', {userId}, node))
      }
    }, 500)
  }
}

@connect((state, { popover: { type, params, node } }) => {
  return {
    type,
    params,
    node
  }
})
export default class Popover extends React.Component {
  static propTypes = {
    dispatch: func,
    type: string,
    params: object,
    node: object
  }

  componentDidMount () {
    const { node } = this.props
    node.addEventListener('mouseleave', this.startHide)
  }

  startHide = () => {
    this.shouldHide = true
    setTimeout(() => this.shouldHide && this.hide(), 400)
  }

  cancelHide = () => {
    if (this.shouldHide) this.shouldHide = false
  }

  hide = () => {
    this.props.dispatch(hidePopover())
    this.props.node.removeEventListener('mouseleave', this.startHide)
  }

  calculateStyle () {
    const { node } = this.props
    const pos = position(node)
    const rect = node.getBoundingClientRect()
    const popoverHeight = 380
    const popoverWidth = 280
    const pageMargin = 20
    const maxLeft = document.documentElement.clientWidth - popoverWidth - pageMargin
    const centerOnLink = pos.x + rect.width / 2 - popoverWidth / 2
    const left = Math.max(pageMargin, Math.min(centerOnLink, maxLeft))
    const above = rect.top > popoverHeight + 70

    return {
      above,
      outer: {left, top: pos.y + (above ? -30 : rect.height)},
      inner: {[above ? 'bottom' : 'top']: 15}
    }
  }

  render () {
    const { type, params } = this.props

    const { above, outer, inner } = this.calculateStyle()

    var content

    switch (type) {
      case 'tag':
        content = <TagPopover {...params} />
        break
    }

    return <div className='popover-container' style={outer}
      onMouseMove={this.cancelHide} onMouseLeave={this.hide}>
      <div className={cx('popover', above ? 'above' : 'below')} style={inner}>
        {content}
      </div>
    </div>
  }
}
