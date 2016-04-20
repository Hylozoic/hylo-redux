import React from 'react'
import { getKeyCode, keyMap } from '../util/textInput'
import {
  exitNode,
  insertJSX,
  removeCurrentNode,
  replaceNodeWithJSX,
  selectCurrentNode
} from '../util/tinymce'
import { includes, some } from 'lodash'

export const hashtagAttribute = 'data-autocompleting'

const triggerKeyCodes = [keyMap.HASH, keyMap.AT_SIGN]
const triggers = ['#', '@']
const template = keyCode =>
  <a {...{[hashtagAttribute]: true}}>
    {String.fromCharCode(keyCode)}
  </a>

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
    return !!this.domNode().getAttribute(hashtagAttribute)
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

  finishTag (choice, event) {
    const keyCode = getKeyCode(event)
    if (keyCode === keyMap.ENTER) {
      // this is a workaround for the fact that we can't suppress the insertion
      // of a new linebreak due to Enter in TinyMCE. (well, it's alleged that
      // you can, but only by defining a callback when first initializing it.)
      //
      // so we assume a new paragraph has been inserted, backtrack to the node
      // we were trying to replace, and remove the new paragraph.
      const extraP = window.tinymce.$(this.domNode())
      const origP = extraP.prev()
      const node = origP.find(`[${hashtagAttribute}]`).last()[0]
      origP.append(extraP.contents())
      this.editor.dom.remove(extraP)
      this.editor.selection.select(node)
    }

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

    this.updateSearch(event)
  }

  handleKeyDown = event => {
    const keyCode = getKeyCode(event)
    switch (keyCode) {
      case keyMap.SPACE:
        if (this.isInTag()) {
          exitNode(this.editor, keyCode)
          event.preventDefault()
        }
        break
      case keyMap.BACKSPACE:
        // remove the tag entirely if backspacing over its first character
        if (this.tagValueIsEmpty()) {
          removeCurrentNode(this.editor)
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

  updateSearch = event => {
    const keyCode = getKeyCode(event)
    if (this.isInTag()) {
      // trigger or reset typeahead
      const value = keyCode === keyMap.ESC ? null : this.tagValue()
      this.search(value)
    } else {
      // always reset typeahead if not inside a tag
      if (this.lastSearch) this.search(null)
    }
  }
}

export default RichTextTagger
