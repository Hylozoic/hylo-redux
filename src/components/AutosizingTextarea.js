// based on:
// https://github.com/javierjulio/textarea-autosize/blob/master/src/jquery.textarea_autosize.js

import React from 'react'
const { func } = React.PropTypes

export default class AutosizingTextarea extends React.Component {
  static propTypes = {
    onInput: func,
    onKeyUp: func
  }

  componentDidMount () {
    this.resize()
  }

  resize () {
    this.textarea.style.height = 0
    this.textarea.style.height = this.textarea.scrollHeight + 'px'
  }

  focus () {
    this.textarea.focus()
  }

  setCursorLocation (pos) {
    this.textarea.selectionStart = pos
    this.textarea.selectionEnd = pos
  }

  render () {
    const { onKeyUp, onInput, ...props } = this.props
    const wrapHandler = handler => event => {
      this.resize()
      if (handler) return handler(event)
    }

    return <textarea ref={c => this.textarea = c}
      onKeyUp={wrapHandler(onKeyUp)}
      onInput={wrapHandler(onInput)}
      {...props} />
  }
}
