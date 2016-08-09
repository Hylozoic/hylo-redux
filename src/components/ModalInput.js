import React from 'react'
import cx from 'classnames'
const { func, string, array } = React.PropTypes

class ModalInput extends React.Component {

  static propTypes = {
    label: string,
    placeholder: string,
    className: string,
    defaultValue: string,
    value: string,
    type: string,
    onChange: func,
    prefix: string
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
      label, placeholder, defaultValue, value, onChange, className, type, prefix
    } = this.props
    const { active } = this.state

    return <div className={cx(className, 'modal-input', {active})}
      onClick={() => this.refs.input.focus()}>
      <label>{label}</label>
      {prefix && <span className='prefix'>{prefix}</span>}
      {type === 'textarea'
        ? <textarea ref='input'
          placeholder={placeholder}
          defaultValue={defaultValue}
          value={value}
          onChange={onChange}
          onFocus={() => this.setState({active: true})}
          onBlur={() => this.setState({active: false})} />
        : <input type={type || 'text'} ref='input'
          placeholder={placeholder}
          defaultValue={defaultValue}
          value={value}
          onChange={onChange}
          onFocus={() => this.setState({active: true})}
          onBlur={() => this.setState({active: false})} />}
    </div>
  }
}

export default ModalInput

export class ModalSelect extends React.Component {
  static propTypes = {
    label: string,
    placeholder: string,
    className: string,
    defaultValue: string,
    value: string,
    onChange: func,
    children: array
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  getValue () {
    return this.refs.select.value
  }

  render () {
    const {
      label, placeholder, defaultValue, value, onChange, className, children
    } = this.props

    const { active } = this.state

    return <div className={cx(className, 'modal-input', {active})}
      onClick={() => this.refs.select.focus()}>
      <label>{label}</label>
      <select ref='select'
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        onFocus={() => this.setState({active: true})}
        onBlur={() => this.setState({active: false})}>
        {children}
      </select>
    </div>
  }
}
