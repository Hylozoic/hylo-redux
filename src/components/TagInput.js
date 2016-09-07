import React from 'react'
import { debounce, isEmpty } from 'lodash'
import { KeyControlledItemList } from './KeyControlledList'
import { getKeyCode, keyMap } from '../util/textInput'
import { NonLinkAvatar } from './Avatar'
import cx from 'classnames'
const { array, bool, string, func } = React.PropTypes

export default class TagInput extends React.Component {
  static propTypes = {
    tags: array,
    type: string,
    choices: array,
    handleInput: func.isRequired,
    onSelect: func,
    onRemove: func,
    allowNewTags: bool,
    placeholder: string,
    filter: func,
    className: string
  }

  resetInput () {
    this.refs.input.value = ''
    this.props.handleInput('')
  }

  handleKeys = event => {
    let { allowNewTags, onSelect, handleInput, filter } = this.props
    const keyCode = getKeyCode(event)

    if (this.refs.list) {
      this.refs.list.handleKeys(event)

      // if the current input brings up search results, but you wish to enter
      // the tag as-is rather than choosing a search result, you can press
      // Escape to clear the results, then press Enter to select what you've
      // typed
      if (allowNewTags && keyCode === keyMap.ESC) handleInput('')
      return
    } else if (allowNewTags && keyCode === keyMap.ENTER) {
      let { value } = event.target
      onSelect({id: value, name: value})
      this.resetInput()
      return
    }

    if (filter) filter(event)
  }

  select = choice => {
    this.props.onSelect(choice)
    this.resetInput()
  }

  remove = tag => event => {
    this.props.onRemove(tag)
    event.preventDefault()
  }

  focus = () => {
    this.refs.input.focus()
  }

  handleChange = debounce(value => {
    this.props.handleInput(value)
  }, 200)

  render () {
    let { choices, tags, placeholder, className } = this.props
    if (!tags) tags = []
    if (!placeholder) placeholder = 'Type...'

    return <div className={cx('tag-input', className)} onClick={this.focus}>
      <ul>
        {tags.map(t => <li key={t.id} className='tag'>
          {t.avatar_url && <NonLinkAvatar person={t}/>}
          {t.label || t.name}
          <a onClick={this.remove(t)} className='remove'>&times;</a>
        </li>)}
      </ul>

      <input ref='input' type='text' placeholder={placeholder} spellCheck={false}
        onChange={event => this.handleChange(event.target.value)}
        onKeyDown={this.handleKeys}/>

      {!isEmpty(choices) && <div className='dropdown'>
        <KeyControlledItemList className='dropdown-menu' ref='list' items={choices} onChange={this.select}/>
      </div>}
    </div>
  }
}
