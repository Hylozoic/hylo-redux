import React from 'react'
import KeyControlledList from './KeyControlledList'
import cx from 'classnames'
const { array, bool, func, object, string } = React.PropTypes

export default class Select extends React.Component {
  static propTypes = {
    choices: array.isRequired,
    onChange: func.isRequired,
    selected: object.isRequired,
    className: string,
    alignRight: bool
  }

  constructor (props) {
    super(props)
    this.state = {active: false}
  }

  toggle = event => {
    event.preventDefault()
    event.stopPropagation()
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

  hide = event => {
    if (this.state.active) this.setState({active: false})
  }

  componentDidMount () {
    window.addEventListener('click', this.hide)
  }

  componentWillUnmount () {
    window.removeEventListener('click', this.hide)
  }

  render () {
    const { choices, selected, className, alignRight } = this.props
    const { active } = this.state
    const buttonClasses = cx('btn btn-default dropdown-toggle', selected.className)

    return <div className={cx('btn-group dropdown', className, {active})}>
      <button className={buttonClasses} onClick={this.toggle}
        onKeyDown={this.handleKeys}>
        {selected.name} <span className='caret'></span>
      </button>
      {active && <KeyControlledList ref='list' items={choices}
        className={cx('dropdown-menu', {'dropdown-menu-right': alignRight})}
        onChange={this.change} selected={selected}/>}
    </div>
  }
}
