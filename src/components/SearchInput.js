import React from 'react'
const { func } = React.PropTypes

export default class SearchInput extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  static propTypes = {
    onChange: func.isRequired
  }

  render () {
    const handleChange = ({ target: { value } }) => this.setState({value})
    const handleKeyUp = ({ which }) =>
      which === 13 && this.props.onChange(this.state.value)

    return <input type='text' placeholder='Search'
      onKeyUp={handleKeyUp} onChange={handleChange}/>
  }
}
