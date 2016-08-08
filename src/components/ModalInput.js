import React from 'react'
import cx from 'classnames'
const { func, string } = React.PropTypes

class ModalInput extends React.Component {

  static propTypes = {
    label: string,
    placeholder: string,
    className: string,
    defaultValue: string,
    value: string,
    type: string,
    onChange: func
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  getValue () {
    return this.refs.input.value
  }

  render () {
    const {
      label, placeholder, defaultValue, value, onChange, className, type
    } = this.props
    const { active } = this.state

    return <div className={cx(className, 'modal-input', {active})}
      onClick={() => this.refs.input.focus()}>
      <label>{label}</label>
      <input type={type || 'text'} ref='input'
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        onFocus={() => this.setState({active: true})}
        onBlur={() => this.setState({active: false})} />
    </div>
  }
}

export default ModalInput
