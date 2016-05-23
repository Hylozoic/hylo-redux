import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash'
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
        {backdrop && active && <a className='backdrop'/>}
      </VelocityTransitionGroup>
    </div>
  }
}
