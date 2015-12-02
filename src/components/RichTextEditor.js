import config from '../../config'
import React from 'react'
import TinyMCE from 'react-tinymce'
import cx from 'classnames'
import Mention from './Mention'
import uuid from 'react-tinymce/lib/helpers/uuid'
const { array, func, string } = React.PropTypes

const editorConfig = {
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
    mentionTemplate: func,
    mentionSelector: string,
    mentionChoices: array,
    mentionTypeahead: func,
    content: string
  }

  constructor (props) {
    super(props)

    // this window check is a workaround for server rendering of a single-post
    // page. if we call uuid() on the server it keeps a single count for all
    // requests, but the client starts from 0 for each request.
    //
    // a different workaround would have to be implemented if we were to add
    // a server-rendered page that had two or more editors on it.
    if (typeof window !== 'undefined') {
      this.editorId = uuid()
    } else {
      this.editorId = 'react-tinymce-0'
    }
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
    let {
      className, content,
      mentionTemplate, mentionSelector, mentionChoices, mentionTypeahead
    } = this.props

    return <div className={cx('rich-text-editor', className)}>
      <TinyMCE config={editorConfig} id={this.editorId}
        onChange={this.handleChange}
        onSetContent={this.handleChange}
        content={content}/>

      <Mention template={mentionTemplate}
        mentionSelector={mentionSelector}
        choices={mentionChoices}
        typeahead={mentionTypeahead}
        editorId={this.editorId}/>
    </div>
  }
}
