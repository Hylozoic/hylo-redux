import React from 'react'
import { indexOf, isEmpty } from 'lodash'
import { find } from 'lodash/fp'
import { getKeyCode, keyMap } from '../util/textInput'
var { array, func, object, bool } = React.PropTypes

export class KeyControlledItemList extends React.Component {

  static propTypes = {
    onChange: func.isRequired,
    items: array,
    selected: object,
    tabChooses: bool
  }

  // this method is called from other components
  handleKeys = event => {
    this.refs.gkcl.handleKeys(event)
  }

  change = (choice, event) => {
    event.preventDefault()
    this.props.onChange(choice, event)
  }

  onChangeExtractingItem = (choice, event) => {
    const item = find(i => i.id === choice.key, this.props.items)
    this.change(item, event)
  }

  // FIXME use more standard props e.g. {label, value} instead of {id, name}, or
  // provide an API for configuring them
  render () {
    let { items, onChange, ...props } = this.props
    return <KeyControlledList ref='gkcl' tabChooses
      onChange={this.onChangeExtractingItem} {...props}>
      {items.map((c, i) =>
        <li key={c.id || 'blank'}>
          <a onClick={event => this.change(c, event)}>{c.name}</a>
        </li>)}
    </KeyControlledList>
  }
}

export class KeyControlledList extends React.Component {

  static propTypes = {
    onChange: func,
    children: array,
    selected: object,
    tabChooses: bool
  }

  static defaultProps = {
    tabChooses: false
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
        event.preventDefault()
        this.changeSelection(-1)
        return true
      case keyMap.DOWN:
        event.preventDefault()
        this.changeSelection(1)
        return true
      case keyMap.TAB:
        if (!this.props.tabChooses) return true
        // otherwise execution continues in the next case
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
