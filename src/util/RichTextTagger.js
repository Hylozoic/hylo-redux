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
export const justCreatedAttribute = 'data-just-created'

const nbsp = String.fromCharCode(160) // non-breaking space
const triggerKeyCodes = [keyMap.HASH, keyMap.AT_SIGN]
const triggers = ['#', '@']

const template = keyCode => {
  const attrs = {
    [hashtagAttribute]: true,
    [justCreatedAttribute]: true,
    spellCheck: false,
    contentEditable: true,
    autoComplete: false,
    autoCorrect: false
  }
  // FIXME autoComplete and autoCorrect don't appear even though they are valid
  // in React -- probably being stripped by tinymce?
  return <a {...attrs}>{String.fromCharCode(keyCode)}</a>
}

const Mention = ({ person }) =>
  <a data-user-id={person.id} href={'/u/' + person.id}>
    {person.name}
  </a>

export class RichTextTagger {
  constructor (editor, autocomplete) {
    this.editor = editor
    this.autocomplete = autocomplete
  }

  // if in a text node, will return its parent
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

  canStartTag () {
    const { selection } = this.editor
    const rng = selection.getRng(true)
    const pos = rng.startOffset
    if (pos === 0) return true

    const char = rng.startContainer.textContent.slice(pos - 1)
    return includes([nbsp, ' '], char) // Chrome & Firefox respectively
  }

  finishTag (choice, event) {
    const keyCode = getKeyCode(event)
    if (keyCode === keyMap.ENTER) {
      // this is a workaround for the fact that we can't suppress the insertion
      // of a new linebreak due to Enter in TinyMCE. (well, it's alleged that
      // you can, but only by defining a callback when first initializing
      // TinyMCE.)
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
    if (includes(triggerKeyCodes, keyCode) && this.canStartTag()) {
      event.preventDefault()
      insertJSX(template(keyCode), this.editor)

      // if the cursor is not in the tag that was just created (this happens on
      // Firefox), we have to move it there
      const node = this.domNode()
      if (node.tagName !== 'A') {
        // there's probably a simpler way to find the tag than this...
        const tag = window.tinymce.$(node).find(`[${justCreatedAttribute}]`)[0]
        this.editor.selection.setCursorLocation(tag, 1)
        tag.removeAttribute(justCreatedAttribute)
      } else {
        node.removeAttribute(justCreatedAttribute)
      }
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
