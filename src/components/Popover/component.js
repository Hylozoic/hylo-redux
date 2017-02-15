import React, { PropTypes } from 'react'
import cx from 'classnames'
import { position } from '../../util/scrolling'
import TagPopover from '../TagPopover'
import PersonPopover from '../PersonPopover'

export default class Popover extends React.Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    params: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired,
    hidePopover: PropTypes.func.isRequired
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
    this.props.hidePopover()
    this.props.node.removeEventListener('mouseleave', this.startHide)
  }

  calculateStyle () {
    const { node } = this.props
    const pos = position(node)
    const rect = node.getBoundingClientRect()
    const popoverHeight = 380
    const popoverWidth = this.type === 'tag' ? 280 : 250
    const pageMargin = 20
    const maxLeft = document.documentElement.clientWidth - popoverWidth - pageMargin
    const centerOnLink = pos.x + rect.width / 2 - popoverWidth / 2
    const above = rect.top > popoverHeight + 70

    let left = Math.max(pageMargin, Math.min(centerOnLink, maxLeft))
    if (isNaN(left)) left = 0

    let top = pos.y + (above ? -30 : rect.height)
    if (isNaN(top)) top = 0

    return {
      above,
      outer: {left, top},
      inner: {[above ? 'bottom' : 'top']: 15}
    }
  }

  render () {
    const { type, params } = this.props
    const { above, outer, inner } = this.calculateStyle()
    const typeClass = 'p-' + type

    let content
    switch (type) {
      case 'tag':
        content = <TagPopover {...params} />
        break
      case 'person':
        content = <PersonPopover {...params} />
        break
    }

    return <div className={cx('popover-container', typeClass)} style={outer}
      onMouseMove={this.cancelHide} onMouseLeave={this.hide}>
      <div className={cx('popover', typeClass, above ? 'above' : 'below')} style={inner}>
        {content}
      </div>
    </div>
  }
}
