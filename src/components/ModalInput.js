import React from 'react'
import cx from 'classnames'
const { func, string, object } = React.PropTypes

class ModalInput extends React.Component {

  static propTypes = {
    label: string,
    placeholder: string,
    className: string,
    value: object,
    onChange: func
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    const { label, placeholder, value, onChange, className } = this.props

    const { active } = this.state

    const focus = () => this.setState({active: true})
    const blur = () => this.setState({active: false})

    return <div className={cx(className, 'modal-input', {active})}>
      <label>{label}</label>
      <input type='text'
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={focus}
        onBlur={blur} />
    </div>
  }
}

export default ModalInput
