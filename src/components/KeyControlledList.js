import React from 'react'
import cx from 'classnames'
import { indexOf, isEmpty } from 'lodash'
import { getKeyCode, keyMap } from '../util/textInput'
var { array, func, object } = React.PropTypes

export default class KeyControlledList extends React.Component {

  static propTypes = {
    onChange: func.isRequired,
    items: array,
    selected: object
  }

  constructor (props) {
    super(props)
    let { items, selected } = props
    let index = indexOf(items, selected)
    this.state = {selectedIndex: index !== -1 ? index : 0}
  }

  componentWillReceiveProps (nextProps) {
    var max = nextProps.items.length - 1
    if (this.state.selectedIndex > max) {
      this.setState({selectedIndex: max})
    }
  }

  changeSelection = delta => {
    if (isEmpty(this.props.items)) return

    var i = this.state.selectedIndex
    var length = this.props.items.length

    i += delta
    if (i < 0) i += length
    i = i % length

    this.setState({selectedIndex: i})
  }

  // this method is called from other components
  handleKeys = event => {
    switch (getKeyCode(event)) {
      case keyMap.UP:
        this.changeSelection(-1)
        return true
      case keyMap.DOWN:
        this.changeSelection(1)
        return true
      case keyMap.TAB:
      case keyMap.ENTER:
        if (!isEmpty(this.props.items)) {
          var choice = this.props.items[this.state.selectedIndex]
          this.change(choice, event)
        }
        return true
    }
  }

  change = (choice, event) => {
    event.preventDefault()
    this.props.onChange(choice, event)
  }

  // FIXME use more standard props e.g. {label, value} instead of {id, name}, or
  // provide an API for configuring them
  render () {
    let { selectedIndex } = this.state
    let { items, onChange, ...props } = this.props
    return <ul {...props}>
      {items.map((c, i) =>
        <li key={c.id || 'blank'} className={cx({active: selectedIndex === i})}>
          <a onClick={event => this.change(c, event)}>{c.name}</a>
        </li>)}
    </ul>
  }
}

export class GenericKeyControlledList extends React.Component {

  static propTypes = {
    onChange: func,
    children: array,
    selected: object
  }

  constructor (props) {
    super(props)
    let { children, selected } = props
    let index = indexOf(children, selected)
    this.state = {selectedIndex: index !== -1 ? index : 0}
  }

  componentWillReceiveProps (nextProps) {
    var max = nextProps.children.length - 1
    if (this.state.selectedIndex > max) {
      this.setState({selectedIndex: max})
    }
  }

  changeSelection = delta => {
    if (isEmpty(this.props.children)) return

    var i = this.state.selectedIndex
    var length = this.props.children.length

    i += delta
    if (i < 0) i += length
    i = i % length

    this.setState({selectedIndex: i})
  }

  // this method is called from other components
  handleKeys = event => {
    switch (getKeyCode(event)) {
      case keyMap.UP:
        this.changeSelection(-1)
        return true
      case keyMap.DOWN:
        this.changeSelection(1)
        return true
      case keyMap.TAB:
      case keyMap.ENTER:
        if (!isEmpty(this.props.children)) {
          var choice = this.props.children[this.state.selectedIndex]
          this.change(choice, event)
        }
        return true
    }
  }

  change = (choice, event) => {
    event.preventDefault()
    this.props.onChange(choice, event)
  }

  // FIXME use more standard props e.g. {label, value} instead of {id, name}, or
  // provide an API for configuring them
  render () {
    let { selectedIndex } = this.state
    let { children, onChange, ...props } = this.props

    const childrenSelected = children.map((child, i) => {
      if (selectedIndex !== i) return child
      return {
        ...child, props: {
          ...child.props,
          className: child.props.className + ' active'
        }
      }
    })

    return <ul {...props}>
      {childrenSelected}
    </ul>
  }
}
