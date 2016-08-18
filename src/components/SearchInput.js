import React from 'react'
import { onEnter } from '../util/textInput'
const { func } = React.PropTypes

export default class SearchInput extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  static propTypes = {
    onChange: func.isRequired
  }

  focus () {
    this.refs.input.focus()
  }

  clear () {
    this.refs.input.value = ''
  }

  render () {
    const handleChange = ({ target: { value } }) => this.setState({value})
    const handleKeyUp = onEnter(() => this.props.onChange(this.state.value))

    return <input type='text' placeholder='Search' ref='input'
      onKeyUp={handleKeyUp} onChange={handleChange}/>
  }
}
