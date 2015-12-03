import React from 'react'
import KeyControlledList from './KeyControlledList'
import cx from 'classnames'
const { array, func, object, string } = React.PropTypes

export default class Select extends React.Component {
  static propTypes = {
    choices: array.isRequired,
    onChange: func.isRequired,
    selected: object.isRequired,
    className: string
  }

  constructor (props) {
    super(props)
    this.state = {active: false}
  }

  toggle = event => {
    event.preventDefault()
    this.setState({active: !this.state.active})
  }

  change = choice => {
    this.props.onChange(choice)
    this.setState({active: false})
  }

  handleKeys = event => {
    if (!this.state.active) return
    if (this.refs.list.handleKeys(event)) event.preventDefault()
  }

  render () {
    let { choices, selected, className } = this.props
    let { active } = this.state

    return <div className={cx('btn-group dropdown', className, {active: active})}>
      <button className='btn btn-default dropdown-toggle'
        onClick={this.toggle} onKeyDown={this.handleKeys}>
        {selected.name} <span className='caret'></span>
      </button>
      <KeyControlledList className='dropdown-menu'
        ref='list' items={choices} onChange={this.change}/>
    </div>
  }
}
