import React from 'react'
import autoproxy from 'autoproxy'
import { connect } from 'react-redux'
import TinyMCE from 'react-tinymce'
import cx from 'classnames'
import uuid from 'react-tinymce/lib/helpers/uuid'
import { assetUrl } from '../util/assets'
import RichTextTagger from '../util/RichTextTagger'
import KeyControlledList from '../components/KeyControlledList'
import { get, isEmpty, merge } from 'lodash'
import { typeahead } from '../actions'
import { getKeyCode, keyMap, replaceNodeWithJSX } from '../util/tinymce'
const { array, bool, func, string } = React.PropTypes
import { position } from '../util/scrolling'

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

const templateForChoice = choice => {
  const { id, name, avatar_url } = choice
  // sort of a dumb heuristic: users have avatar_urls and tags don't
  return avatar_url
    ? <a data-user-id={id} href={'/u/' + id}>{name}</a>
    : <a data-search={`#${name}`} data-tag-id={id}>#{name}</a>
}

// @autoproxy allows the instance methods of the class to be accessible even
// after it is decorated with @connect, which wouldn't otherwise be possible.
// However, it doesn't do the same for instance variables. We handle those by
// calling getWrappedInstance() below (see _self()) instead of naively using
// `this`, which is the undecorated class in the constructor and
// componentDidMount but the decorated class otherwise.
//
@autoproxy(connect((state, { name }) => ({
  typeaheadOptions: get(state, `typeaheadMatches.${name}`)
}), null, null, {withRef: true}))
export default class RichTextEditor extends React.Component {
  static propTypes = {
    onChange: func.isRequired,
    onKeyUp: func,
    onKeyDown: func,
    onKeyPress: func,
    onReady: func,
    className: string,
    content: string,
    startFocused: bool,
    name: string,
    typeaheadOptions: array,
    dispatch: func
  }

  constructor (props) {
    super(props)
    this.state = {dropdown: {x: 0, y: 0}}

    if (typeof window !== 'undefined') {
      this._editorId = uuid()

      // these can be set only on the client side.
      merge(editorConfig, {
        content_css: assetUrl('/index.css'),

        // TODO initialize this elsewhere so that it can adapt to a change in
        // viewport size
        autoresize_max_height: document.documentElement.clientHeight * 0.7
      })
    } else {
      // do not use uuid() on the server, because it will keep a single count
      // for all requests. this can be a dumb value because we don't expect the
      // editor to work on the server anyway.
      this._editorId = 'react-tinymce-0'
    }
  }

  _self () {
    return this.getWrappedInstance ? this.getWrappedInstance() : this
  }

  _handleChange = event => {
    // use the standard property name
    event.target.value = event.target.getContent()
    return this.props.onChange(event)
  }

  // getting the editor is asynchronous because tinymce loads plugins and
  // stylesheets from the network when the first editor is rendered
  _pollForEditor (callback) {
    const self = this._self()
    if (!self._editorPoller) {
      self._editorPoller = new EditorPoller(self, self._editorId, callback)
    } else {
      self._editorPoller.addCallback(callback)
    }
  }

  _handleListKey (event) {
    // there's no way to prevent the insertion of a linebreak into the editor
    // when Enter is pressed, unless the event handler is set during
    // tinymce.init. until we can find a way to do that or some other
    // workaround, we're disabling picking a tag with Enter. Tab and clicking
    // still work.
    if (getKeyCode(event) === keyMap.ENTER) {
      this.autocomplete(null)
      return
    }

    if (this.refs.list && this.refs.list.handleKeys(event)) {
      event.preventDefault()
      return true
    }
  }

  componentDidMount () {
    const { onReady, onKeyDown, onKeyUp, onKeyPress, startFocused } = this.props

    this._pollForEditor(editor => {
      onReady && onReady(editor)
      startFocused && editor.focus()

      this.tagger = new RichTextTagger(editor, this.autocomplete)

      editor.on('keydown', event => {
        onKeyDown && onKeyDown(event)
        this._handleListKey(event) || this.tagger.handleKeyDown(event)
      })

      editor.on('keyup', event => {
        onKeyUp && onKeyUp(event)
        this.tagger.handleKeyUp(event)
      })

      editor.on('keypress', event => {
        onKeyPress && onKeyPress(event)
        this.tagger.handleKeyPress(event)
      })
    })
  }

  autocomplete = (term, node) => {
    const { dispatch, name } = this.props
    dispatch(typeahead(term, name))
    if (!node) return

    const nodePos = position(node)
    const editorPos = position(this.getEditor().iframeElement)
    const containerPos = position(this.refs.container)
    const lineHeight = 15

    this.setState({
      dropdown: {
        left: nodePos.x + editorPos.x - containerPos.x,
        top: nodePos.y + editorPos.y - containerPos.y + lineHeight
      }
    })
  }

  setContent (text) {
    this.getEditor().setContent(text)
  }

  focus () {
    const editor = this.getEditor()
    if (editor) return editor.focus()
    this._pollForEditor(editor => editor.focus())
  }

  getContent () {
    return this.getEditor().getContent()
  }

  getEditor () {
    return this._self().editor
  }

  render () {
    const { className, content, typeaheadOptions } = this.props
    const { dropdown: { left, top } } = this.state

    const selectTypeahead = choice => {
      this.autocomplete(null)
      replaceNodeWithJSX(templateForChoice(choice), this.getEditor())
    }

    return <div className={cx('rich-text-editor', className)} ref='container'>
      <TinyMCE config={editorConfig} id={this._self()._editorId}
        onChange={this._handleChange}
        onSetContent={this._handleChange}
        content={content}/>

      {!isEmpty(typeaheadOptions) &&
        <div className='dropdown active' style={{left, top}}>
          <KeyControlledList className='dropdown-menu'
            ref='list'
            items={typeaheadOptions}
            onChange={selectTypeahead}/>
        </div>}
    </div>
  }
}

class EditorPoller {
  constructor (parent, editorId, callback) {
    this._parent = parent
    this._editorId = editorId
    this._callbacks = [callback]
    this._poll()
  }

  _poll () {
    const waitMs = 30
    const { editors } = window.tinymce.EditorManager
    let attempts = 1
    this.pollInterval = setInterval(() => {
      this._parent.editor = editors.find(e => e.id === this._editorId)
      const elapsed = attempts * waitMs
      if (this._parent.editor) {
        console.log(`got ${this._editorId} after ${elapsed} ms; ` +
          `calling ${this._callbacks.length} callback(s)`)
        clearInterval(this.pollInterval)
        this._callbacks.forEach(c => c(this._parent.editor))
      } else {
        attempts += 1
        if (attempts > 100) {
          console.error(`couldn't get ${this._editorId} after ${elapsed} ms`)
          clearInterval(this.pollInterval)
        }
      }
    }, waitMs)
  }

  addCallback (callback) {
    if (this._parent.editor) return callback(this._parent.editor)
    this._callbacks.push(callback)
  }
}
