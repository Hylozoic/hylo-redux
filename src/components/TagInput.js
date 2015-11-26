import React from 'react'
import { curry, isEmpty } from 'lodash'
import KeyControlledList from './KeyControlledList'
var {array, string, func} = React.PropTypes

export default class TagInput extends React.Component {

  static propTypes = {
    tags: array,
    type: string,
    getChoices: func,
    onSelect: func,
    onRemove: func
  }

  constructor (props) {
    super(props)
    this.state = {choices: []}
  }

  handleInput = event => {
    var value = event.target.value
    var choices = this.props.getChoices(value) || []

    this.setState({choices: choices})
  }

  handleKeys = event => {
    if (this.refs.list) this.refs.list.handleKeys(event)
  }

  select = choice => {
    this.props.onSelect(choice)
    this.refs.input.value = ''
    this.setState({choices: []})
  }

  remove = (tag, event) => {
    this.props.onRemove(tag)
    event.preventDefault()
  }

  focus = () => {
    this.refs.input.focus()
  }

  render () {
    var {choices} = this.state
    return <div className='tag-input' onClick={this.focus}>
      <ul>
        {this.props.tags.map(t => <li key={t.id} className='tag'>
          <div className='icon' style={{backgroundImage: `url(${t.avatar_url})`}}/>
          {t.name}
          <a onClick={curry(this.remove)(t)} className='remove'>&times;</a>
        </li>)}
      </ul>

      <input ref='input' type='text' placeholder='Type...'
        onChange={this.handleInput}
        onKeyDown={this.handleKeys}/>

      {!isEmpty(choices) && <div className='dropdown'>
        <KeyControlledList className='dropdown-menu' ref='list' items={choices} onChange={this.select}/>
      </div>}
    </div>
  }
}
