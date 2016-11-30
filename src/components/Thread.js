import React from 'react'
import { debounce, filter } from 'lodash'
import { get, map, min } from 'lodash/fp'
const { array, bool, func, object } = React.PropTypes
import MessageSection from './MessageSection'
import MessageForm from './MessageForm'
import A from './A'
import PeopleTyping from './PeopleTyping'
import { connect } from 'react-redux'
import { FETCH_COMMENTS } from '../actions'
import { fetchComments } from '../actions/comments'
import { onThreadPage, offThreadPage } from '../actions/threads'
import { getComments } from '../models/post'
import { getSocket, socketUrl } from '../client/websockets'
import { trackEvent, VIEWED_MESSAGE_THREAD } from '../util/analytics'
import { position, positionInViewport } from '../util/scrolling'

@connect((state, { post }) => ({
  messages: getComments(post, state),
  pending: state.pending[FETCH_COMMENTS]
}))
export default class Thread extends React.Component {
  static propTypes = {
    post: object,
    messages: array,
    dispatch: func,
    pending: bool
  }

  static childContextTypes = {post: object}

  getChildContext () {
    return {post: this.props.post}
  }

  static contextTypes = {isMobile: bool}

  setupForThread (post) {
    this.props.dispatch(onThreadPage(post.id))
    if (this.socket) {
      this.socket.post(socketUrl(`/noo/post/${post.id}/subscribe`)) // for people typing

      if (this.reconnectHandler) {
        this.socket.off('reconnect', this.reconnectHandler)
      }

      this.reconnectHandler = () => {
        // TODO ask server for new messages
        this.socket.post(socketUrl(`/noo/post/${post.id}/subscribe`))
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
      this.refs.form.getWrappedInstance().focus()
    }

    trackEvent(VIEWED_MESSAGE_THREAD)
  }

  componentDidMount () {
    this.socket = getSocket()
    this.setupForThread(this.props.post)
  }

  componentWillReceiveProps (nextProps) {
    const oldId = get('post.id', this.props)
    const newId = get('post.id', nextProps)
    if (newId !== oldId) {
      if (this.socket) {
        this.socket.off('reconnect', this.reconnectHandler)
        this.socket.post(socketUrl(`/noo/post/${oldId}/unsubscribe`))
      }
      this.setupForThread(nextProps.post)
    }
  }

  componentWillUnmount () {
    const postId = get('post.id', this.props)
    this.props.dispatch(offThreadPage())
    if (this.socket) {
      this.socket.off('reconnect', this.reconnectHandler)
      this.socket.post(socketUrl(`/noo/post/${postId}/unsubscribe`))
    }
  }

  _moveHeader = debounce(() => {
    const header = document.querySelector('.thread .header')
    const pos = position(header)
    const vpos = positionInViewport(header)
    const targetY = this.refs.form.getWrappedInstance().isFocused() ? 0 : 60
    console.log(`target ${targetY}, vpos ${vpos.y}, pos ${pos.y}`)
    if (vpos.y !== targetY) {
      header.style.top = (pos.y + (targetY - vpos.y)) + 'px'
      console.log('changed to ' + header.style.top)
    }
  }, 50)

  render () {
    const { post, messages, pending, dispatch } = this.props
    const { isMobile } = this.context
    const loadMore = () => {
      if (pending || messages.length >= post.numComments) return
      const beforeId = min(map('id', messages))
      dispatch(fetchComments(post.id, {refresh: true, newest: true, limit: 20, beforeId}))
      .then(() => this.refs.messageSection.scrollToMessage(beforeId))
    }

    const moveHeader = isMobile ? () => setTimeout(this._moveHeader, 20) : null

    return <div className='thread'>
      <Header />
      <MessageSection {...{messages, pending}} thread={post}
        onScroll={isMobile ? this._moveHeader : null}
        onScrollToTop={loadMore} ref='messageSection'/>
      <PeopleTyping showNames/>
      <MessageForm postId={post.id} ref='form' onFocus={moveHeader}
        onBlur={moveHeader}/>
    </div>
  }
}

export const Header = (props, { currentUser, post }) => {
  const followers = post.followers
  const gt2 = followers.length - 2
  const { id } = currentUser
  const others = filter(followers, f => f.id !== id)

  return <div className='header'>
    You and <A to={`/u/${others[0].id}`}>{others[0].name}</A>
    {others.length > 1 && <span>and ${gt2} other{gt2 === 1 ? '' : 's'}</span>}
  </div>
}
Header.contextTypes = {post: object, currentUser: object}
