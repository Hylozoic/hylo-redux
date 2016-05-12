import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash'
import { isMobile } from '../client/util'
import { VelocityTransitionGroup } from 'velocity-react'
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
    backdrop: bool
  }

  toggle = event => {
    let { active } = this.state
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
    if (this.state.active) {
      // without this delay, the dropdown sometimes closes without registering a
      // click on a link in its list
      setTimeout(() => this.setState({active: false}), 10)
    }
    return true
  }

  componentDidMount () {
    this.touchEvent = isMobile() ? 'touchend' : 'click'
    window.addEventListener(this.touchEvent, this.hide)
  }

  componentWillUnmount () {
    window.removeEventListener(this.touchEvent, this.hide)
  }

  render () {
    let { toggleChildren, className, children, alignRight, backdrop } = this.props
    let active = this.state.active && !isEmpty(children)
    return <div className={cx('dropdown', className, {active})}>
      <a className='dropdown-toggle' onClick={this.toggle}>
        {toggleChildren}
      </a>
      <ul className={cx('dropdown-menu', {'dropdown-menu-right': alignRight})}
        onClick={() => this.toggle()}>
        {children}
      </ul>
      <VelocityTransitionGroup
        enter={{animation: 'fadeIn', duration: 100}}
        leave={{animation: 'fadeOut', duration: 100}}>
        {backdrop && active && <div className='backdrop'/>}
      </VelocityTransitionGroup>
    </div>
  }
}
