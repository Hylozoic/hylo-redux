import React from 'react'
import TinyMCE from 'react-tinymce'
import cx from 'classnames'
import Mention from './Mention'
import uuid from 'react-tinymce/lib/helpers/uuid'
import { assetUrl } from '../util/assets'
import { merge } from 'lodash'
const { array, bool, func, string } = React.PropTypes

const editorConfig = {
  menubar: false,
  statusbar: false,
  plugins: ['paste', 'autolink', 'link', 'autoresize'],
  paste_as_text: true,
  // toolbar: 'bold italic | bullist numlist | link unlink',
  toolbar: false,
  resize: true,
  relative_urls: false,
  autoresize_bottom_margin: 0
}

export default class RichTextEditor extends React.Component {
  static propTypes = {
    onChange: func.isRequired,
    onKeyUp: func,
    className: string,
    mentionTemplate: func,
    mentionSelector: string,
    mentionChoices: array,
    mentionTypeahead: func,
    content: string,
    startFocused: bool
  }

  constructor (props) {
    super(props)

    if (typeof window !== 'undefined') {
      this.editorId = uuid()

      // these can be set only on the client side.
      merge(editorConfig, {
        content_css: assetUrl('/index.css'),

        // TODO initialize this elsewhere so that it can adapt to a change in
        // viewport size
        autoresize_max_height: document.documentElement.clientHeight * 0.7
      })
    } else {
      // do not use uuid() on the server, because it will keep a single count
      // for all requests. this will break if we render a page on the server
      // that has two or more editors on it.
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

  waitForEditor (callback) {
    let attempts = 0
    let interval = setInterval(() => {
      const editor = this.editor()
      if (editor) {
        clearInterval(interval)
        callback(editor)
      }
      attempts += 1
      if (attempts > 100) {
        console.error("couldn't get editor after 100 tries")
        clearInterval(interval)
      }
    }, 30)
  }

  componentDidMount () {
    const { onKeyUp, startFocused } = this.props
    this.waitForEditor(editor => {
      if (onKeyUp) editor.on('keyup', onKeyUp)
      if (startFocused) editor.focus()
    })
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
