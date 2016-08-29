import React from 'react'
import { find, indexOf, isEmpty, omit } from 'lodash/fp'
import { getKeyCode, keyMap } from '../util/textInput'
var { array, func, object, bool, number } = React.PropTypes

export class KeyControlledList extends React.Component {

  static propTypes = {
    onChange: func,
    children: array,
    selectedIndex: number,
    tabChooses: bool
  }

  static defaultProps = {
    selectedIndex: 0,
    tabChooses: false
  }

  constructor (props) {
    super(props)
    let { selectedIndex } = props
    this.state = {selectedIndex}
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
    const { selectedIndex } = this.state
    const { children, onChange, tabChooses, ...props } = this.props

    const childrenSelected = children.map((child, i) => {
      if (selectedIndex !== i) return child
      return {
        ...child, props: {
          ...child.props,
          className: child.props.className + ' active'
        }
      }
    })

    return <ul {...omit('selectedIndex', props)}>
      {childrenSelected}
    </ul>
  }
}

export class KeyControlledItemList extends React.Component {

  static propTypes = {
    onChange: func.isRequired,
    items: array,
    selected: object,
    tabChooses: bool
  }

  // this method is called from other components
  handleKeys = event => {
    this.refs.kcl.handleKeys(event)
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
    const { items, selected, onChange, ...props } = this.props
    const selectedIndex = indexOf(selected, items)
    return <KeyControlledList ref='kcl' tabChooses selectedIndex={selectedIndex}
      onChange={this.onChangeExtractingItem} {...props}>
      {items.map((c, i) =>
        <li key={c.id || 'blank'}>
          <a onClick={event => this.change(c, event)}>{c.name}</a>
        </li>)}
    </KeyControlledList>
  }
}
