import React from 'react'
import cx from 'classnames'
const { func, string, array, object } = React.PropTypes
import { get } from 'lodash/fp'

export default class ModalRow extends React.Component {
  static propTypes = {
    className: string,
    children: array,
    field: object
  }

  focus () {
    this.setState({active: true})
  }

  blur () {
    this.setState({active: false})
  }

  constructor (props) {
    super(props)
    this.state = {
      active: false
    }
  }

  render () {
    const { children, className, field } = this.props
    const { active } = this.state

    const onClick = get('focus', field) && (() => field.focus())

    return <div className={cx(className, 'modal-input', {active})}
      onClick={onClick}>
      {children}
    </div>
  }
}

export class ModalInput extends React.Component {
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

  getValue () {
    return this.refs.input.value
  }

  render () {
    const {
      label, placeholder, defaultValue, value, onChange, className, type, prefix
    } = this.props

    const onFocus = () => this.refs.row.focus()
    const onBlur = () => this.refs.row.blur()

    return <ModalRow className={className} field={this.refs.input} ref='row'>
      <label>{label}</label>
      {prefix && <span className='prefix'>{prefix}</span>}
      {type === 'textarea'
        ? <textarea ref='input'
          placeholder={placeholder}
          defaultValue={defaultValue}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur} />
        : <input type={type || 'text'} ref='input'
          placeholder={placeholder}
          defaultValue={defaultValue}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur} />}
    </ModalRow>
  }
}

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
  }

  getValue () {
    return this.refs.select.value
  }

  render () {
    const {
      label, placeholder, defaultValue, value, onChange, className, children
    } = this.props

    const onFocus = () => this.refs.row.focus()
    const onBlur = () => this.refs.row.blur()

    return <ModalRow className={className} field={this.refs.select} ref='row'>
      <label>{label}</label>
      <select ref='select'
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}>
        {children}
      </select>
    </ModalRow>
  }
}
