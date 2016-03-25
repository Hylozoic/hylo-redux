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
    this.area.style.height = 0
    this.area.style.height = this.area.scrollHeight + 'px'
  }

  focus () {
    this.area.focus()
  }

  render () {
    const { onKeyUp, onInput, ...props } = this.props
    const wrapHandler = handler => event => {
      this.resize()
      if (handler) return handler(event)
    }

    return <textarea ref={c => this.area = c}
      onKeyUp={wrapHandler(onKeyUp)}
      onInput={wrapHandler(onInput)}
      {...props}/>
  }
}
