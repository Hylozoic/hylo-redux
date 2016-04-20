import { renderToStaticMarkup } from 'react-dom/server'
import { keyMap } from './textInput'

export const replaceNodeWithJSX = (component, editor) =>
  replaceNode(renderToStaticMarkup(component), editor)

export const replaceNode = (newContent, editor) => {
  const { selection } = editor
  selection.select(selection.getNode())
  removeCurrentNode(editor)
  editor.insertContent(newContent + '&nbsp;')
}

export const insertJSX = (component, editor) =>
  editor.insertContent(renderToStaticMarkup(component))

// move the cursor to just after the end of the node it's currently in. append
// the correct content so that when the user continues typing, their new input
// doesn't end up back in the node they just left.
export const exitNode = (editor, keyCode) => {
  const { selection } = editor
  selection.select(selection.getNode())
  selection.collapse()
  switch (keyCode) {
    case keyMap.ENTER:
      editor.insertContent('<p>&nbsp;</p>')
      selection.select(selection.getNode())
      selection.collapse(true)
      break
    case keyMap.SPACE:
      editor.insertContent('&nbsp;')
      break
  }
}

export const removeCurrentNode = editor => {
  const { dom, selection } = editor
  dom.remove(selection.getNode())
}

export const selectCurrentNode = editor => {
  const { selection } = editor
  selection.select(selection.getNode())
}

export const prepend = (text, editor) => {
  editor.selection.setCursorLocation(null, 0)
  editor.execCommand('mceInsertContent', false, text, {skip_focus: true})
}
