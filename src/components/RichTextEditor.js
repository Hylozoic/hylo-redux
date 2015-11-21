import config from '../../config'
import React from 'react'
import TinyMCE from 'react-tinymce'
import cx from 'classnames'
import Mention from './Mention'
import uuid from 'react-tinymce/lib/helpers/uuid'
var {func, string} = React.PropTypes

var editorConfig = {
  content_css: config.cssBundle,
  menubar: false,
  statusbar: false,
  plugins: ['paste', 'autolink', 'link'],
  paste_as_text: true,
  toolbar: 'bold italic | bullist numlist | link unlink',
  resize: true,
  relative_urls: false
}

export default class RichTextEditor extends React.Component {
  static propTypes = {
    onChange: func,
    className: string,
    template: func,
    mentionSelector: string
  }

  constructor (props) {
    super(props)
    this.editorId = uuid()
  }

  handleChange = event => {
    // use the standard property name
    event.target.value = event.target.getContent()
    return this.props.onChange(event)
  }

  setContent (text) {
    this.editor().setContent(text)
  }

  editor () {
    return window.tinymce.EditorManager.editors.find(e => e.id === this.editorId)
  }

  render () {
    var {className, template, mentionSelector} = this.props
    return <div className={cx('rich-text-editor', className)}>
      <TinyMCE config={editorConfig} id={this.editorId}
        onChange={this.handleChange}
        onSetContent={this.handleChange}/>
      <Mention template={template}
        mentionSelector={mentionSelector}
        editorId={this.editorId}/>
    </div>
  }
}
