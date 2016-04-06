// This is based on react-tinymce-mention but has been significantly changed.
// We keep the logic for managing interaction with the editor and tracking an
// @-mention while in progress, but we swap the original implementation for a
// mix of Redux and good old-fashioned local state, and we also don't store a
// list of mentions separately from the text in the editor.
//
// https://github.com/Kindling/react-tinymce-mention/blob/master/src/mention/plugin.js
// https://github.com/Kindling/react-tinymce-mention/blob/master/src/mention/components/TinyMCEDelegate.js
// https://github.com/Kindling/react-tinymce-mention/blob/master/LICENSE

import { renderToStaticMarkup } from 'react-dom/server'
import { debounce, difference, includes, isEmpty, values } from 'lodash'

const keyMap = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  ESC: 27,
  SPACE: 32,
  UP: 38,
  DOWN: 40,
  DELETE: 46
}

const delimiter = '@'

function getKeyCode (event) {
  return event.which || event.keyCode
}

function getLastChar (editor, negativeIndex = 1) {
  const start = editor.selection.getRng(true).startOffset
  const text = editor.selection.getRng(true).startContainer.data || ''
  const character = text.substr(start - negativeIndex, 1)
  return character
}

const getCurrentTypedMention = editor => {
  const words = editor.selection.getNode().innerHTML.split(/ |&/)
  const word = words[words.length - 1]
  if (word[0] !== '@') throw new Error('getCurrentTypedMention got: ' + word)
  return word.slice(1)
}

// TODO: Cleanup
// Force a root element in case one doesn't exist.
function normalizeEditorInput (editor) {
  if (editor.getContent() === '' || editor.getContent({ format: 'raw' }) === '<br>') {
    editor.insertContent(' ')
  }
}

function shouldIgnoreWhileFetching (keyCode) {
  const whiteList = [
    keyMap.ESC,
    keyMap.BACKSPACE,
    keyMap.DELETE
  ]

  return includes(difference(values(keyMap), whiteList), keyCode)
}

// insert a DOM node into the editor, using a placeholder node to ensure
// that the cursor ends up in the right place at the end.
function addNode (node, editor) {
  const re = new RegExp(delimiter + '\\S+(\n<p>)?___PLACEHOLDER___')
  const markup = renderToStaticMarkup(node)
  editor.insertContent('___PLACEHOLDER___&nbsp;<span id="cursor">&nbsp;</span>')
  editor.setContent(editor.getContent().replace(re, markup))

  setTimeout(() => {
    editor.getBody().focus()
    editor.selection.select(editor.dom.select('#cursor')[0])
    editor.selection.collapse(true)
    editor.dom.remove(editor.dom.select('#cursor')[0])
  }, 0)
}

export default class MentionController {

  constructor (component, editor) {
    this.component = component
    this.editor = editor
    this.active = false
    this.editor.on('keypress', this.handleTopLevelEditorInput)
    this.editor.on('keydown', this.handleTopLevelActionKeys)
    this.editor.on('keyup', this.handleBackspace)
  }

  handleTopLevelEditorInput = event => {
    const keyCode = getKeyCode(event)
    const character = String.fromCharCode(keyCode)
    const foundDelimiter = delimiter.indexOf(character) > -1

    normalizeEditorInput(this.editor)

    if (!this.active && foundDelimiter) {
      this.activate()
    } else if (!this.active || character === ' ') {
      this.deactivate()
    }
  }

  handleTopLevelActionKeys = event => {
    const keyCode = getKeyCode(event)

    if (this.active && keyCode === keyMap.BACKSPACE || keyCode === keyMap.DELETE) {
      if (getLastChar(this.editor) === delimiter) {
        this.deactivate()
      }
    }
  }

  handleBackspace = event => {
    const keyCode = getKeyCode(event)
    if (keyCode !== keyMap.BACKSPACE && keyCode !== keyMap.DELETE) return

    const selector = this.component.props.mentionSelector
    const $ = window.tinymce.dom.DomQuery
    const node = this.editor.selection.getNode()
    const foundMentionNode = $(node).closest(selector)[0]

    if (foundMentionNode) {
      this.editor.selection.select(node)
    } else if (!this.editor.getContent({format: 'html'}).trim().length) {
      this.deactivate()
    }
  }

  activate () {
    if (this.active) return

    this.active = true
    this.editor.on('keydown', this.handleActionKeys)
    this.editor.on('keyup', this.handleKeyUp)
  }

  deactivate () {
    if (!this.active) return

    this.active = false
    this.component.resetQuery()
    this.editor.off('keydown', this.handleActionKeys)
    this.editor.off('keyup', this.handleKeyUp)
  }

  handleActionKeys = event => {
    const keyCode = getKeyCode(event)

    if ((this.component.props.fetching && shouldIgnoreWhileFetching(keyCode)) ||
      this.shouldSelectOrMove(keyCode, event)) {
      event.preventDefault()
      return false
    }
  }

  handleKeyUp = debounce(event => {
    var typed = getCurrentTypedMention(this.editor)
    if (typed) this.component.query(typed)
  }, 100)

  shouldSelectOrMove (keyCode, event) {
    switch (keyCode) {
      case keyMap.ESC:
        this.deactivate()
        return true
      case keyMap.SPACE:
        this.deactivate()
        return false
      case keyMap.TAB:
      case keyMap.ENTER:
      case keyMap.DOWN:
      case keyMap.UP:
        if (isEmpty(this.component.props.options)) {
          this.deactivate()
          return false
        } else {
          this.component.handleKeys(event)
          return true
        }
    }
  }

  addMention (node) {
    this.deactivate()
    addNode(node, this.editor)
  }
}
