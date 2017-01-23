import React from 'react'
import cx from 'classnames'
const { func, string, array, object, number } = React.PropTypes
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
    prefix: string,
    maxLength: number,
    errors: object
  }

  getValue () {
    return this.refs.input.value
  }

  blur () {
    return this.refs.input.blur()
  }

  render () {
    const {
      label, placeholder, defaultValue, value, onChange, className, prefix,
      maxLength, errors
    } = this.props

    const type = this.props.type || 'text'

    const inputProps = {
      placeholder, defaultValue, value, onChange, maxLength,
      onFocus: () => this.refs.row.focus(),
      onBlur: () => this.refs.row.blur()
    }

    const input = type === 'textarea'
      ? <textarea ref='input' {...inputProps} />
      : <input type={type} ref='input' {...inputProps} />

    return <ModalRow className={className} field={this.refs.input} ref='row'>
      <label>{label}</label>
      {errors}
      {prefix
        ? <div className='prefix-group'>
            <span className='prefix'>{prefix}</span>
            {input}
          </div>
        : input}
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
