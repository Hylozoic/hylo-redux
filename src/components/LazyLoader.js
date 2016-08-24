import React from 'react'
import { debounce } from 'lodash'
const { func, node } = React.PropTypes

export default class LazyLoader extends React.Component {
  static propTypes = {
    children: node,
    onContentVisible: func
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  checkVisibility = debounce(() => {
    const { onContentVisible } = this.props
    const height = document.documentElement.clientHeight
    const { top, bottom } = this.refs.loader.getBoundingClientRect()

    if ((top > 0 && top < height) || (bottom > 0 && bottom < height)) {
      if (onContentVisible) onContentVisible()
      this.setState({visible: true})
      window.removeEventListener('resize', this.checkVisibility)
      window.removeEventListener('scroll', this.checkVisibility)
    }
  })

  componentDidMount () {
    window.addEventListener('resize', this.checkVisibility)
    window.addEventListener('scroll', this.checkVisibility)
    this.checkVisibility()
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.checkVisibility)
    window.removeEventListener('scroll', this.checkVisibility)
  }

  render () {
    const { visible } = this.state
    const { children } = this.props
    return <div className='lazy-loader' ref='loader'>
      {visible && children}
    </div>
  }
}
