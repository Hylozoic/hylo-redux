import React from 'react'
import { debounce } from 'lodash'
import cx from 'classnames'
const { func, node, string } = React.PropTypes

var loaders

const register = (loader, onShow) => {
  loaders.push({loader, onShow})
  checkOne(loader, onShow)
}

const unregister = (loader) => {
  if (!loaders) return // this happens during hot reloading
  loaders = loaders.filter(x => x.loader !== loader)
}

const checkOne = (loader, onShow) => {
  const height = document.documentElement.clientHeight
  const { top, bottom } = loader.getBoundingClientRect()
  if ((top > 0 && top < height) || (bottom > 0 && bottom < height)) {
    onShow()
    unregister(loader)
  }
}

const check = debounce(() => {
  const height = document.documentElement.clientHeight
  loaders.forEach(({ loader, onShow }) => {
    const { top, bottom } = loader.getBoundingClientRect()
    if ((top > 0 && top < height) || (bottom > 0 && bottom < height)) {
      onShow()
      unregister(loader)
    }
  })
}, 200)

export const init = () => {
  loaders = []
  window.addEventListener('resize', check)
  window.addEventListener('scroll', check)
}

export default class LazyLoader extends React.Component {
  static propTypes = {
    children: node,
    onContentVisible: func,
    className: string
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
    const { onContentVisible } = this.props
    register(this.refs.loader, () => {
      if (onContentVisible) onContentVisible()
      this.setState({visible: true})
    })
  }

  componentWillUnmount () {
    unregister(this.refs.loader)
  }

  render () {
    const { className, children } = this.props
    return <div className={cx('lazy-loader', className)} ref='loader'>
      {this.state.visible && children}
    </div>
  }
}
