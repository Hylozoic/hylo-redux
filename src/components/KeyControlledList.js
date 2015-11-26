import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash'
var { array, func } = React.PropTypes

export default class KeyControlledList extends React.Component {

  static propTypes = {
    onChange: func,
    items: array
  }

  constructor (props) {
    super(props)
    this.state = {selectedIndex: 0}
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

  // FIXME use more standard props e.g. {label, value} instead of {id, name}
  render () {
    let { selectedIndex } = this.state
    let { items, onChange, ...props } = this.props
    return <ul {...props}>
      {items.map((c, i) =>
        <li key={c.id} className={cx({active: selectedIndex === i})}>
          <a onClick={event => this.change(c, event)}>{c.name}</a>
        </li>)}
    </ul>
  }
}
