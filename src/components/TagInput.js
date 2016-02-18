import React from 'react'
import { curry, isEmpty } from 'lodash'
import KeyControlledList from './KeyControlledList'
var {array, bool, string, func} = React.PropTypes

export default class TagInput extends React.Component {

  static propTypes = {
    tags: array,
    type: string,
    choices: array,
    handleInput: func.isRequired,
    onSelect: func,
    onRemove: func,
    allowNewTags: bool
  }

  resetInput () {
    this.refs.input.value = ''
    this.props.handleInput('')
  }

  handleKeys = event => {
    let { allowNewTags, onSelect, handleInput } = this.props

    if (this.refs.list) {
      this.refs.list.handleKeys(event)

      // if the current input brings up search results, but you wish to enter
      // the tag as-is rather than choosing a search result, you can press
      // Escape to clear the results, then press Enter to select what you've
      // typed
      if (allowNewTags && event.which === 27) handleInput('')
    } else if (allowNewTags && event.which === 13) {
      let { value } = event.target
      onSelect({id: value, name: value})
      this.resetInput()
    }
  }

  select = choice => {
    this.props.onSelect(choice)
    this.resetInput()
  }

  remove = (tag, event) => {
    this.props.onRemove(tag)
    event.preventDefault()
  }

  focus = () => {
    this.refs.input.focus()
  }

  render () {
    let { choices, tags } = this.props
    if (!tags) tags = []

    console.log('rendering taginput', {choices, tags})

    return <div className='tag-input' onClick={this.focus}>
      <ul>
        {tags.map(t => <li key={t.id} className='tag'>
          {t.avatar_url && <div className='icon' style={{backgroundImage: `url(${t.avatar_url})`}}/>}
          {t.name}
          <a onClick={curry(this.remove)(t)} className='remove'>&times;</a>
        </li>)}
      </ul>

      <input ref='input' type='text' placeholder='Type...'
        onChange={event => this.props.handleInput(event.target.value)}
        onKeyDown={this.handleKeys}/>

      {!isEmpty(choices) && <div className='dropdown'>
        <KeyControlledList className='dropdown-menu' ref='list' items={choices} onChange={this.select}/>
      </div>}
    </div>
  }
}
