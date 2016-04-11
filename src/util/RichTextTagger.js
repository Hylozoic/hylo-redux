import React from 'react'
import {
  exitNode,
  getKeyCode,
  insertJSX,
  keyMap,
  removeCurrentNode,
  replaceNodeWithJSX,
  selectCurrentNode
} from '../util/tinymce'
import { includes, some } from 'lodash'

const triggerKeyCodes = [keyMap.HASH, keyMap.AT_SIGN]
const triggers = ['#', '@']

const template = keyCode =>
  <a data-autocompleting={true}>{String.fromCharCode(keyCode)}</a>

const Mention = ({ person }) =>
  <a data-user-id={person.id}
    href={'/u/' + person.id}
    data-finalized={true}>
    {person.name}
  </a>

export class RichTextTagger {
  constructor (editor, autocomplete) {
    this.editor = editor
    this.autocomplete = autocomplete
  }

  domNode () {
    return this.editor.selection.getNode()
  }

  search (term) {
    this.lastSearch = term
    this.autocomplete(term, this.domNode())
  }

  isInTag () {
    return !!this.domNode().getAttribute('data-autocompleting')
  }

  isInReplacedTag () {
    return !!this.domNode().getAttribute('data-user-id')
  }

  tagValue () {
    return this.editor.selection.getNode().innerHTML
  }

  tagValueIsEmpty () {
    return some(triggers, t => t === this.tagValue())
  }

  finishTag (choice) {
    // sort of a dumb heuristic: users have avatar_urls and tags don't
    if (choice.avatar_url) {
      replaceNodeWithJSX(<Mention person={choice}/>, this.editor)
    } else {
      // for hashtags, we just update the text in the tag instead of replacing
      // anything, so it can always be edited, autocompleted, or saved as a new
      // hashtag as-is
      this.domNode().textContent = '#' + choice.name
      this.search(null)
      exitNode(this.editor, keyMap.SPACE)
    }
  }

  handleKeyUp = event => {
    const keyCode = getKeyCode(event)

    // select the whole tag when backspacing up to it so it's easy to delete all
    // at once
    if (keyCode === keyMap.BACKSPACE && this.isInReplacedTag()) {
      selectCurrentNode(this.editor)
      return
    }

    if (this.isInTag()) {
      // trigger or reset typeahead
      const value = keyCode === keyMap.ESC ? null : this.tagValue()
      this.search(value)
    } else {
      // always reset typeahead if not inside a tag
      if (this.lastSearch) this.search(null)
    }
  }

  handleKeyDown = event => {
    const keyCode = getKeyCode(event)
    switch (keyCode) {
      case keyMap.ENTER:
      case keyMap.SPACE:
        if (this.isInTag()) {
          this.search(null)
          exitNode(this.editor, keyCode)
          event.preventDefault()
        }
        break
      case keyMap.BACKSPACE:
        // remove the tag entirely if backspacing over its first character
        if (this.tagValueIsEmpty()) {
          removeCurrentNode(this.editor)
          this.search(null)
          event.preventDefault()
        }
    }
  }

  // you can prevent the appearance of the character you typed by calling
  // event.preventDefault()
  handleKeyPress = event => {
    const keyCode = getKeyCode(event)
    // create an empty tag when a trigger character is typed
    if (includes(triggerKeyCodes, keyCode)) {
      insertJSX(template(keyCode), this.editor)
      event.preventDefault()
    }
  }
}

export default RichTextTagger
