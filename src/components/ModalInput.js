import React from 'react'
const { func, string, object } = React.PropTypes

class ModalInput extends React.Component {

  static propTypes = {
    label: string,
    placeholder: string,
    value: object,
    onChange: func
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    const { label, placeholder, value, onChange } = this.props

    return <div className='invite'>
      <label>{label}</label>
      <input type='text'
        placeholder={placeholder}
        value={value}
        onChange={onChange}/>
    </div>
  }
}

export default ModalInput
