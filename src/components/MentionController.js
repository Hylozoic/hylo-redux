// This is based on react-tinymce-mention but has been significantly changed.
// We keep the logic for managing interaction with the editor and tracking an
// @-mention while in progress, but we swap the original Redux implementation
// for a mix of Redux and good old-fashioned component-local state, and we also
// don't store a list of mentions separately from the text in the editor.
//
// https://github.com/Kindling/react-tinymce-mention/blob/master/src/mention/plugin.js
// https://github.com/Kindling/react-tinymce-mention/blob/master/src/mention/components/TinyMCEDelegate.js
// https://github.com/Kindling/react-tinymce-mention/blob/master/LICENSE

import {renderToStaticMarkup} from 'react-dom/server'
import {contains, difference, values} from 'lodash'

const keyMap = {
  BACKSPACE: 8,
  DELETE: 46,
  DOWN: 40,
  ENTER: 13,
  TAB: 9,
  UP: 38,
  ESC: 27
}

const delimiter = '@'

function typedMentionStore () {
  return {
    value: '',

    update (str) {
      this.value = (this.value + str).trim()
      return this.value
    },
    backspace () {
      const val = this.value
      this.value = val.substring(0, val.length - 1).trim()
      return this.value
    },
    clear () {
      this.value = ''
    }
  }
}

function getKeyCode (event) {
  return event.which || event.keyCode
}

function getLastChar (editor, negativeIndex = 1) {
  const start = editor.selection.getRng(true).startOffset
  const text = editor.selection.getRng(true).startContainer.data || ''
  const character = text.substr(start - negativeIndex, 1)
  return character
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

  return contains(difference(values(keyMap), whiteList), keyCode)
}

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

  constructor (component, data) {
    this.component = component
    this.active = false
    this.typedMention = typedMentionStore()

    this.editor = window.tinymce.EditorManager.editors.find(e => e.id === this.prop('editorId'))

    // Firefox fix
    setTimeout(() => {
      this.editor.on('keypress', this.handleTopLevelEditorInput.bind(this))
      this.editor.on('keydown', this.handleTopLevelActionKeys.bind(this))
      this.editor.on('keyup', this.handleBackspace.bind(this))
    }, 50)
  }

  prop (key) {
    return this.component.props[key]
  }

  handleTopLevelEditorInput (event) {
    const keyCode = getKeyCode(event)
    const character = String.fromCharCode(keyCode)
    const foundDelimiter = delimiter.indexOf(character) > -1

    normalizeEditorInput(this.editor)

    if (!this.active && foundDelimiter) {
      this.startListeningForInput()
    } else if (!this.active || character === ' ') {
      this.stopListeningAndCleanup()
    }
  }

  handleTopLevelActionKeys (event) {
    const keyCode = getKeyCode(event)

    if (this.active && keyCode === keyMap.BACKSPACE || keyCode === keyMap.DELETE) {
      if (getLastChar(this.editor) === delimiter) {
        this.stopListeningAndCleanup()
      } else {
        var text = this.updateMentionText(keyCode)
        this.component.query(text)
      }
    }
  }

  handleBackspace (event) {
    const keyCode = getKeyCode(event)
    if (keyCode !== keyMap.BACKSPACE && keyCode !== keyMap.DELETE) return

    const selector = this.prop('mentionSelector')
    const $ = window.tinymce.dom.DomQuery
    const node = this.editor.selection.getNode()
    const foundMentionNode = $(node).closest(selector)[0]

    if (foundMentionNode) {
      this.editor.selection.select(node)
    } else if (!this.editor.getContent({format: 'html'}).trim().length) {
      this.stopListeningAndCleanup()
    } else {
      // TODO what's supposed to happen here?
      // const mentionIds = collectMentionIds(editor, selector)
      // store.dispatch(syncEditorState(mentionIds))
    }
  }

  startListeningForInput () {
    if (this.active) return

    this.active = true
    this.keydownHandler = this.handleActionKeys.bind(this)
    this.keypressHandler = this.handleKeyPress.bind(this)
    this.editor.on('keydown', this.keydownHandler)
    this.editor.on('keypress', this.keypressHandler)
  }

  stopListeningAndCleanup () {
    if (!this.active) return

    this.active = false
    this.typedMention.clear()
    this.component.resetQuery()
    this.editor.off('keydown', this.keydownHandler)
    this.editor.off('keypress', this.keypressHandler)
  }

  handleActionKeys (event) {
    const keyCode = getKeyCode(event)

    if ((this.prop('fetching') && shouldIgnoreWhileFetching(keyCode)) ||
      this.shouldSelectOrMove(keyCode, event)) {
      event.preventDefault()
      return false
    }
  }

  handleKeyPress (event) {
    const keyCode = getKeyCode(event)
    setTimeout(() => {
      var text = this.updateMentionText(keyCode)
      this.component.query(text)
    }, 0)
  }

  shouldSelectOrMove (keyCode, event) {
    if (!this.prop('choices').length) return false

    if (keyCode === keyMap.BACKSPACE || keyCode === keyCode.DELETE) {
      this.typedMention.update(keyCode)
      return this.handleKeyPress(event)
    }

    switch (keyCode) {
      case keyMap.ESC:
        this.stopListeningAndCleanup()
        return true
      case keyMap.TAB:
      case keyMap.ENTER:
      case keyMap.DOWN:
      case keyMap.UP:
        this.component.handleKeys(event)
        return true
    }
  }

  updateMentionText (keyCode) {
    const mentionText = keyCode !== keyMap.BACKSPACE && keyCode !== keyMap.DELETE
      ? this.typedMention.update(getLastChar(this.editor))
      : this.typedMention.backspace()

    return mentionText
  }

  addMention (node) {
    this.stopListeningAndCleanup()
    addNode(node, this.editor)
  }
}
