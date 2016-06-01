import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash'
import { VelocityTransitionGroup } from 'velocity-react'
import { position } from '../util/scrolling'
const { array, bool, func, object, string } = React.PropTypes

export default class Dropdown extends React.Component {
  constructor (props) {
    super(props)
    this.state = {neverOpened: true}
  }

  static propTypes = {
    children: array,
    className: string,
    alignRight: bool,
    toggleChildren: object.isRequired,
    onFirstOpen: func,
    backdrop: bool,
    triangle: bool
  }

  static contextTypes = {
    isMobile: bool
  }

  toggle = event => {
    const { active } = this.state
    this.setState({active: !active})
    if (!active && this.state.neverOpened) {
      this.setState({neverOpened: false})
      if (this.props.onFirstOpen) this.props.onFirstOpen()
    }
    if (event) {
      event.stopPropagation()
      event.preventDefault()
    }
  }

  hide = event => {
    if (this.state.active) this.setState({active: false})
    return true
  }

  componentDidMount () {
    window.addEventListener('click', this.hide)
  }

  componentWillUnmount () {
    window.removeEventListener('click', this.hide)
  }

  render () {
    const {
      toggleChildren, className, children, alignRight, backdrop, triangle
    } = this.props
    const { isMobile } = this.context
    const active = this.state.active && !isEmpty(children)
    return <div className={cx('dropdown', className, {active})} ref='parent'>
      <a className='dropdown-toggle' onClick={this.toggle}>
        {toggleChildren}
      </a>
      <ul className={cx('dropdown-menu', {'dropdown-menu-right': alignRight})}
        style={menuStyle(isMobile, this.refs.parent)}
        onClick={() => this.toggle()}>
        {triangle && <li className='triangle'
          style={{left: findTriangleLeftPos(this.refs.parent)}}/>}
        {children}
      </ul>
      <VelocityTransitionGroup
        enter={{animation: 'fadeIn', duration: 100}}
        leave={{animation: 'fadeOut', duration: 100}}>
        {(backdrop || isMobile) && active && <a className='backdrop'/>}
      </VelocityTransitionGroup>
    </div>
  }
}

const margin = 10

const menuStyle = (isMobile, parent) => {
  if (!isMobile || typeof document === 'undefined') return {}
  return {
    left: findLeftPos(parent) + margin,
    width: document.documentElement.clientWidth - margin * 2
  }
}

const findLeftPos = parent => parent ? -position(parent).x : null

const findTriangleLeftPos = parent =>
  parent ? position(parent).x + parent.offsetWidth / 2 - margin - 1 : null
