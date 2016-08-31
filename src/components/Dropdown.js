import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash'
import { VelocityTransitionGroup } from 'velocity-react'
import { position } from '../util/scrolling'
const { array, bool, func, object, string } = React.PropTypes

const DROPDOWN_OPENED = 'dropdown-opened'

export default class Dropdown extends React.Component {
  constructor (props) {
    super(props)
    this.state = {neverOpened: true}
  }

  static propTypes = {
    children: array,
    id: string,
    className: string,
    alignRight: bool,
    toggleChildren: object.isRequired,
    onFirstOpen: func,
    backdrop: bool,
    triangle: bool,
    openOnHover: bool,
    rivalrous: string
  }

  static contextTypes = {
    isMobile: bool
  }

  toggle = (event, context) => {
    const { active } = this.state
    this.setState({active: !active})
    if (active) {
      this.setState({hoverOpened: false})
    } else {
      if (context === 'hover') {
        this.setState({hoverOpened: true})
      }
      if (this.state.neverOpened) {
        this.setState({neverOpened: false})
        if (this.props.onFirstOpen) this.props.onFirstOpen()
      }
      if (this.props.rivalrous) {
        window.dispatchEvent(new window.CustomEvent(DROPDOWN_OPENED, {
          detail: {name: this.props.rivalrous}
        }))
      }
    }
    if (event) {
      event.stopPropagation()
      event.preventDefault()
    }
  }

  hide = () => {
    if (this.state.active) this.setState({active: false})
    return true
  }

  rivalrousHide = event => {
    if (event.detail.name === this.props.rivalrous) {
      return this.hide()
    }
  }

  componentDidMount () {
    window.addEventListener('click', this.hide)
    if (this.props.rivalrous) {
      window.addEventListener(DROPDOWN_OPENED, this.rivalrousHide)
    }
  }

  componentWillUnmount () {
    window.removeEventListener('click', this.hide)
    if (this.props.rivalrous) {
      window.removeEventListener(DROPDOWN_OPENED, this.rivalrousHide)
    }
  }

  render () {
    const {
      toggleChildren, children, alignRight, backdrop, triangle, openOnHover, id
    } = this.props
    const { hoverOpened } = this.state
    const { isMobile } = this.context
    const active = this.state.active && !isEmpty(children)
    const className = cx('dropdown', this.props.className,
      {active, 'has-triangle': triangle})

    return <div id={id} className={className} ref='parent'>
      <a className='dropdown-toggle' onClick={this.toggle}
        onMouseEnter={ev => openOnHover && this.toggle(ev, 'hover')}>
        {toggleChildren}
      </a>
      <ul className={cx('dropdown-menu', {'dropdown-menu-right': alignRight})}
        style={mobileMenuStyle(isMobile && active, this.refs.parent)}
        onClick={() => this.toggle()}
        onMouseLeave={() => hoverOpened && this.toggle()}>
        {triangle && <li className='triangle'
          style={{left: findTriangleLeftPos(isMobile, this.refs.parent)}}/>}
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

const mobileMenuStyle = (shouldUse, parent) => {
  if (!shouldUse) return {}
  return {
    left: findLeftPos(parent) + margin,
    width: document.documentElement.clientWidth - margin * 2
  }
}

const findLeftPos = parent => parent ? -position(parent).x : null

const findTriangleLeftPos = (isMobile, parent) => {
  if (!isMobile || !parent) return
  return position(parent).x + parent.offsetWidth / 2 - margin - 1
}
