import React from 'react'
import { render } from 'react-dom'
import RichTextEditor from '../../../../src/components/RichTextEditor'
import { configureStore } from '../../../../src/store'
import { Provider } from 'react-redux'

const store = configureStore().store

render(<Provider store={store}>
  <RichTextEditor onReady={() => window.editorReady = true}/>
</Provider>, document.body)
