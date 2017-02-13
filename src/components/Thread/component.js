import React from 'react'
import { debounce, filter, sortBy } from 'lodash'
import { get, map, min, max } from 'lodash/fp'
const { array, bool, object } = React.PropTypes
import MessageSection from '../MessageSection'
import MessageForm from '../MessageForm'
import A from '../A'
import PeopleTyping from '../PeopleTyping'
import { getSocket, socketUrl } from '../../client/websockets'
import { trackEvent, VIEWED_MESSAGE_THREAD } from '../../util/analytics'
import { position, positionInViewport } from '../../util/scrolling'

export default class Thread extends React.Component {
  static propTypes = {
    post: object,
    messages: array,
    pending: bool,
    actions: object.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {scrolledUp: false}
  }

  static contextTypes = {
    isMobile: bool,
    currentUser: object
  }

  setupForThread () {
    const { post: { id } } = this.props
    this.props.actions.onThreadPage()
    if (this.socket) {
      this.socket.post(socketUrl(`/noo/post/${id}/subscribe`)) // for people typing

      if (this.reconnectHandler) {
        this.socket.off('reconnect', this.reconnectHandler)
      }

      this.reconnectHandler = () => {
        const { messages } = this.props
        const afterId = max(map('id', messages))
        this.props.actions.fetchAfter(afterId)
        .then(() => this.refs.messageSection.scrollToBottom())
        this.socket.post(socketUrl(`/noo/post/${id}/subscribe`))
      }
      this.socket.on('reconnect', this.reconnectHandler)
    }

    // trying to focus the textarea on page load on mobile is problematic
    // because the unpredictable timing of the data loading makes it hard to
    // move the header to the correct place at the correct time. it can't happen
    // before the keyboard appears on mobile.
    //
    // not to mention, the keyboard is prevented from appearing if the page is
    // being loaded from scratch, but document.activeElement is still set to the
    // textarea as if the focusing was successful.
    //
    // so for now we have a simple workaround: just skip it on mobile entirely.
    if (!this.context.isMobile) {
      this.refs.form.focus()
    }

    trackEvent(VIEWED_MESSAGE_THREAD)
  }

  componentDidMount () {
    this.socket = getSocket()
    this.setupForThread()
  }

  disableSocket () {
    const postId = get('post.id', this.props)
    if (this.socket) {
      this.socket.off('reconnect', this.reconnectHandler)
      this.socket.post(socketUrl(`/noo/post/${postId}/unsubscribe`))
    }
  }

  componentWillReceiveProps (nextProps) {
    const oldId = get('post.id', this.props)
    const newId = get('post.id', nextProps)
    if (newId !== oldId) this.disableSocket()
  }

  componentDidUpdate (prevProps) {
    const oldId = get('post.id', prevProps)
    const newId = get('post.id', this.props)
    if (newId !== oldId && newId) this.setupForThread()
  }

  componentWillUnmount () {
    this.props.actions.offThreadPage()
    this.disableSocket()
  }

  _moveHeader = debounce(() => {
    const header = document.querySelector('.thread .header')
    const pos = position(header)
    const vpos = positionInViewport(header)
    const targetY = this.refs.form.isFocused() ? 0 : 60
    if (vpos.y !== targetY) {
      header.style.top = (pos.y + (targetY - vpos.y)) + 'px'
    }
  }, 50)

  render () {
    const { post, pending, actions } = this.props
    const { currentUser, isMobile } = this.context
    const { scrolledUp } = this.state
    const loadMore = () => {
      if (pending || messages.length >= post.numComments) return
      const beforeId = min(map('id', messages))
      actions.fetchBefore(beforeId)
      .then(() => this.refs.messageSection.scrollToMessage(beforeId))
    }
    const moveHeader = isMobile ? () => setTimeout(this._moveHeader, 20) : null
    const messages = sortBy(this.props.messages || [], 'created_at')

    return <div className='thread'>
      <Header post={post} />
      <MessageSection {...{messages, pending}} thread={post}
        onLeftBottom={() => this.setState({scrolledUp: true})}
        onHitBottom={() => this.setState({scrolledUp: false})}
        onScroll={isMobile ? this._moveHeader : null}
        onScrollToTop={loadMore} ref='messageSection' />
      <PeopleTyping showNames showBorder={scrolledUp} />
      {hasNewMessages(messages, currentUser, post) && scrolledUp &&
        <div className='newMessagesNotify' onClick={this.refs.messageSection.scrollToBottom}>
          New Messages
        </div>}
      <MessageForm postId={post.id} ref='form' onFocus={moveHeader}
        onBlur={moveHeader} createComment={actions.createComment} />
    </div>
  }
}

function hasNewMessages (messages, post, currentUser) {
  const latestMessage = messages.length && messages[messages.length - 1]
  const latestFromOther = latestMessage && latestMessage.user_id !== currentUser.id
  return latestFromOther && post.last_read_at &&
    new Date(latestMessage.created_at) > new Date(post.last_read_at)
}

function Header ({ post }, { currentUser }) {
  const followers = post.followers
  const gt2 = followers.length - 2
  const { id } = currentUser
  const others = filter(followers, f => f.id !== id)

  return <div className='header'>
    You and <A to={`/u/${others[0].id}`}>{others[0].name}</A>
    {others.length > 1 && <span>and ${gt2} other{gt2 === 1 ? '' : 's'}</span>}
  </div>
}
Header.contextTypes = {currentUser: object}
