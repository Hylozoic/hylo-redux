import React from 'react'
import cx from 'classnames'
const { func, string } = React.PropTypes

export class ModalField extends React.Component {
  static propTypes = {
    label: string,
    className: string,
    Field: func,
    onClick: func
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    const {
      label, className, Field, onClick
    } = this.props
    const { active } = this.state

    return <div className={cx(className, 'modal-input', {active})}
      onClick={onClick}>
      {label && <label>{label}</label>}
      <Field
        onFocus={() => this.setState({active: true})}
        onBlur={() => this.setState({active: false})}/>
    </div>
  }
}

class ModalInput extends React.Component {

  static propTypes = {
    placeholder: string,
    className: string,
    label: string,
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
      placeholder, defaultValue, value, onChange, className, type, label
    } = this.props

    const Field = ({ onFocus, onBlur }) => <input type={type || 'text'}
      placeholder={placeholder}
      defaultValue={defaultValue}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur} />

    return <ModalField
      label={label}
      className={className}
      onClick={() => this.refs.input.focus()}
      Field={Field}/>
  }
}

export default ModalInput
