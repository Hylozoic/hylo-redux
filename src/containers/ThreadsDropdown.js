import React from 'react'
import { connect } from 'react-redux'
import { isEmpty } from 'lodash'
import { compact, flow, last, map, sortBy } from 'lodash/fp'
import cx from 'classnames'
import { threadUrl } from '../routes'
import {
  FETCH_POSTS,
  closeModal,
  setUnseenThreadCount,
  incrementUnseenThreads,
  showDirectMessage,
  updateUserSettings
} from '../actions'
import { appendComment } from '../actions/comments'
import { appendThread } from '../actions/threads'
import { fetchPosts } from '../actions/fetchPosts'
import { unseenThreadCount } from '../util/threads'
import { getComments, getPost, denormalizedPost } from '../models/post'
const { number, bool, string, array, func, object } = React.PropTypes
import A from '../components/A'
import { NonLinkAvatar } from '../components/Avatar'
import Dropdown from '../components/Dropdown'
import Icon from '../components/Icon'
import { getSocket, socketUrl } from '../client/websockets'
import { truncate } from '../util/text'
import { Modal } from '../components/Modal'
import { trackEvent, STARTED_MESSAGE, VIEWED_MESSAGE_THREAD_LIST } from '../util/analytics'

const setLastViewedToNow = () =>
  updateUserSettings({settings: {last_viewed_messages_at: new Date().toISOString()}})

const getThreads = state =>
  flow(
    map(id => {
      const post = getPost(id, state)
      const comments = getComments(post, state)
      if (isEmpty(comments)) return
      return {...denormalizedPost(post, state), comments}
    }),
    compact,
    sortBy(t => -1 * new Date(t.updated_at))
  )(state.postsByQuery.threads)

@connect((state, props) => ({
  threads: getThreads(state),
  pending: state.pending[FETCH_POSTS],
  openedThreadId: state.openedThreadId
}))
export default class ThreadsDropdown extends React.Component {
  static propTypes = {
    openedThreadId: string,
    threads: array,
    pending: bool,
    lastViewed: string,
    newCount: number
  }

  static contextTypes = {
    dispatch: func,
    currentUser: object
  }

  constructor (props) {
    super(props)
    this.state = { open: false }
  }

  componentDidMount () {
    this.socket = getSocket()
    if (this.socket) {
      this.socket.post(socketUrl('/noo/threads/subscribe'))
      this.socket.on('newThread', this.newThread)
      this.socket.on('messageAdded', this.messageAdded)

      this.reconnectHandler = () => {
        // TODO clear cache in dropdown
        this.socket.post(socketUrl('/noo/threads/subscribe'))
      }
      this.socket.on('reconnect', this.reconnectHandler)
    }
  }

  componentWillUnmount () {
    if (this.socket) {
      this.socket.post(socketUrl('/noo/threads/unsubscribe'))
      this.socket.off('newThread')
      this.socket.off('messageAdded')
      this.socket.off('reconnect', this.reconnectHandler)
    }
  }

  newThread = thread => {
    const { dispatch } = this.context
    dispatch(appendThread(thread))
    if (!this.state.open) {
      dispatch(incrementUnseenThreads())
    }
  }

  setUnseen = (threads, lastViewed) =>
    this.context.dispatch(setUnseenThreadCount(unseenThreadCount(threads, lastViewed)))

  messageAdded = data => {
    const { postId, message } = data
    const { dispatch } = this.context
    const { lastViewed, openedThreadId, threads } = this.props
    const thisThreadOpen = openedThreadId === postId

    if (this.state.open || thisThreadOpen) return dispatch(appendComment(postId, message))

    if (!threads.length) { // or you don't have the thread in question?
      dispatch(fetchPosts({cacheId: 'threads', subject: 'threads'}))
      .then(({ payload }) => this.setUnseen(payload.posts, lastViewed))
    } else {
      dispatch(appendComment(postId, message))
      const updatedThreads = map(t => t.id === postId ? { ...t, updated_at: message.created_at } : t, threads)
      this.setUnseen(updatedThreads, lastViewed)
    }
  }

  render () {
    const { threads, pending, newCount } = this.props
    const { dispatch } = this.context

    const onOpen = () => {
      dispatch(setLastViewedToNow())
      trackEvent(VIEWED_MESSAGE_THREAD_LIST)
      this.setState({ open: true })
    }
    const onClose = () => this.setState({ open: false })
    const startMessage = () => {
      trackEvent(STARTED_MESSAGE, {context: 'dropdown'})
      return dispatch(showDirectMessage())
    }

    return <Dropdown alignRight rivalrous='nav' className='thread-list'
      onFirstOpen={() => dispatch(fetchPosts({cacheId: 'threads', subject: 'threads'}))}
      onOpen={onOpen}
      onClose={onClose}
      toggleChildren={<span>
        <Icon name='Message-Smile'/>
        {newCount > 0 && <div className='badge'>{newCount}</div>}
      </span>}>
      {!pending && <li className='top'>
        <div className='newMessage' onClick={startMessage}>
          <Icon name='Compose'/><span className='button-text'>New Message</span>
        </div>
      </li>}
      {pending && <li className='loading'>Loading...</li>}
      {threads.map(thread => <li key={thread.id}>
        <ThreadListItem thread={thread}/>
      </li>)}
    </Dropdown>
  }
}

const ThreadListItem = ({ thread }, { currentUser, dispatch }) => {
  const { comments, followers, last_read_at, updated_at } = thread
  const comment = last(sortBy('created_at', comments))
  const unread = !last_read_at || new Date(updated_at) > new Date(last_read_at)
  const follower = followers.find(f => f.id !== currentUser.id)
  if (!comment || !follower) return null

  return <A to={threadUrl(thread.id)} className={cx({unread})}>
    {unread && <div className='dot-badge'/>}
    <NonLinkAvatar person={follower}/>
    <span>
      <strong>{follower.name}</strong>&nbsp;
      {comment.user_id === currentUser.id ? 'You: ' : ''}
      {truncate(comment.text, 80)}
    </span>
  </A>
}
ThreadListItem.contextTypes = {dispatch: func, currentUser: object}

@connect(state => ({
  threads: getThreads(state),
  pending: state.pending[FETCH_POSTS]
}))
export class ThreadsModal extends React.Component {
  static propTypes = {
    dispatch: func,
    threads: array,
    onCancel: func,
    pending: bool
  }

  componentDidMount () {
    const { dispatch } = this.props
    dispatch(fetchPosts({cacheId: 'threads', subject: 'threads'}))
    dispatch(setLastViewedToNow())
  }

  render () {
    const { onCancel, threads, pending, dispatch } = this.props
    const startNewMessage = event => {
      dispatch(closeModal())
      dispatch(showDirectMessage())
      event.stopPropagation()
    }

    return <Modal id='threads-modal' onCancel={onCancel} title='Messages'>
      <ul onClick={onCancel} className='thread-list'>
        {!pending && <li className='top'>
          <div className='newMessage' onClick={startNewMessage}>
            <Icon name='Compose'/><span className='button-text'>New Message</span>
          </div>
        </li>}
        {pending && <li className='loading'>Loading...</li>}
        {threads.map(thread => <li key={thread.id}>
          <ThreadListItem thread={thread}/>
        </li>)}
      </ul>
    </Modal>
  }
}
