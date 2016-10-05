import React from 'react'
import { get, debounce, throttle } from 'lodash'
import { connect } from 'react-redux'
import { createComment } from '../actions/comments'
import { findOrCreateThread, updateMessageEditor } from '../actions/threads'
import { textLength } from '../util/text'
import { onCmdOrCtrlEnter } from '../util/textInput'
import AutosizingTextarea from './AutosizingTextarea'
import cx from 'classnames'
const NEW_MESSAGE_ID = 'new'  
var { array, bool, func, object, string } = React.PropTypes

@connect((state, { userId }) => {
  return ({
    currentUser: get(state, 'people.current'),
    text: state.messageEdits[userId],
    newText: state.messageEdits[NEW_MESSAGE_ID]
  })
})
export default class MessageToUserForm extends React.Component {
  static propTypes = {
    currentUser: object,
    onComplete: func,
    postId: string,
    userId: string,
    text: string,
    newText: string
  }

  static contextTypes = {
    isMobile: bool,
    dispatch: func
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
    const modifierKey = window.navigator.platform.startsWith('Mac')
      ? 'Cmd' : 'Ctrl'
    this.setState({modifierKey})
  }

  componentWillReceiveProps (nextProps) {
    const { userId, newText } = this.props
    const { dispatch } = this.context
    const nextUserId = nextProps.userId
    if (!userId && nextUserId) {
      dispatch(updateMessageEditor(nextUserId, newText))
      dispatch(updateMessageEditor(NEW_MESSAGE_ID, ''))
    }
  }

  submit = event => {
    const { onComplete, postId, userId, text } = this.props
    const { dispatch } = this.context
    if (event) event.preventDefault()
    if (!userId) return false
    const cleanText = text.replace(/<p>&nbsp;<\/p>$/m, '')
    if (!cleanText || textLength(cleanText) < 2) return false

    dispatch(createComment(postId, text)).then(({ error }) => {
      if (error) return
      onComplete()
    })
    return false
  }

  render () {
    const {
      currentUser, userId, text, newText
    } = this.props
    const { modifierKey } = this.state
    const { isMobile, dispatch } = this.context
    const updateStore = text => dispatch(updateMessageEditor(userId || NEW_MESSAGE_ID, text))
    const setText = event => updateStore(event.target.value)

    const handleKeyDown = e => {
      onCmdOrCtrlEnter(e => {
        if (!userId) return
        e.preventDefault()
        this.submit()
        updateStore('')
      }, e)
    }

    return <form onSubmit={this.submit} className='message-to-user'>
      <AutosizingTextarea ref='editor' name='message'
        value={userId ? text : newText}
        placeholder='Type a message...'
        onChange={setText}
        onKeyDown={handleKeyDown}/>
      <input type='submit' value='Send' ref='button' className={ cx({ enabled: !!userId && (text || newText) }) } />
      {!isMobile && modifierKey && <span className='meta help-text'>
          or press {modifierKey}-Enter
      </span>}
    </form>
  }
}

