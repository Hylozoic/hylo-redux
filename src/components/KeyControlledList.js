import React from 'react'
import cx from 'classnames'
import { indexOf, isEmpty } from 'lodash'
var { array, func, object } = React.PropTypes

export default class KeyControlledList extends React.Component {

  static propTypes = {
    onChange: func,
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
    switch (event.which) {
      case 38: // up arrow
        this.changeSelection(-1)
        return true
      case 40: // down arrow
        this.changeSelection(1)
        return true
      case 9: // tab
      case 13: // enter
        if (!isEmpty(this.props.items)) {
          var choice = this.props.items[this.state.selectedIndex]
          this.change(choice, event)
        }
        return true
    }
  }

  change = (choice, event) => {
    event.preventDefault()
    this.props.onChange(choice)
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
