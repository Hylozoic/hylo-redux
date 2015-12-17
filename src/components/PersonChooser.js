import React from 'react'
import TagInput from './TagInput'
import { filter } from 'lodash'
var {array, func} = React.PropTypes

export default class PersonChooser extends React.Component {

  static propTypes = {
    choices: array,
    onSelect: func
  }

  getChoices = value => {
    let { choices } = this.props
    if (value.length < 2) return []
    return filter(choices, person => person.name.substr(0, value.length).toLowerCase() === value.toLowerCase())
  }

  render () {
    let { onSelect } = this.props
    return <TagInput tags={[]} getChoices={this.getChoices} onSelect={onSelect}/>
  }
}
