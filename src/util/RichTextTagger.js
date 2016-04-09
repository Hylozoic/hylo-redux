import React from 'react'
import { exitNode, getKeyCode, insertJSX, keyMap, removeCurrentNode } from '../util/tinymce'
import { includes, some } from 'lodash'

const triggerKeyCodes = [keyMap.HASH, keyMap.AT_SIGN]
const triggers = ['#', '@']
const className = 'autocompleting-tag'

const template = keyCode => {
  const trigger = String.fromCharCode(keyCode)
  return <span className={className}>{trigger}</span>
}

export default class RichTextTagger {
  constructor (editor, search) {
    this.editor = editor
    this.search = search
  }

  domNode () {
    return this.editor.selection.getNode()
  }

  isInTag () {
    return this.domNode().className === className
  }

  tagValue () {
    return this.editor.selection.getNode().innerHTML
  }

  tagValueIsEmpty () {
    return some(triggers, t => t === this.tagValue())
  }

  handleKeyUp = event => {
    if (this.isInTag()) {
      if (getKeyCode(event) === keyMap.ESC) {
        this.search(null)
      } else {
        this.search(this.tagValue(), this.domNode())
      }
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
    }

    if (keyCode === keyMap.BACKSPACE && this.tagValueIsEmpty()) {
      removeCurrentNode(this.editor)
      this.search(null)
      event.preventDefault()
    }
  }

  // you can prevent the appearance of the character you typed by calling
  // event.preventDefault()
  handleKeyPress = event => {
    const keyCode = getKeyCode(event)
    if (includes(triggerKeyCodes, keyCode)) {
      insertJSX(template(keyCode), this.editor)
      event.preventDefault()
    }
  }
}
