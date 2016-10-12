import React from 'react'
import { connect } from 'react-redux'
import { isEmpty } from 'lodash'
import { compact, flow, map, sortBy } from 'lodash/fp'
import cx from 'classnames'
import { threadUrl } from '../routes'
import { FETCH_POSTS, incrementUnreadThreads, showDirectMessage, updateUserSettings } from '../actions'
import { appendComment } from '../actions/comments'
import { appendThread } from '../actions/threads'
import { fetchPosts } from '../actions/fetchPosts'
import { getComments, getPost, denormalizedPost } from '../models/post'
const { number, bool, string, array, func, object } = React.PropTypes
import A from '../components/A'
import { NonLinkAvatar } from '../components/Avatar'
import Dropdown from '../components/Dropdown'
import Icon from '../components/Icon'
import { getSocket, socketUrl } from '../client/websockets'

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

@connect(
  (state, props) => ({
    threads: getThreads(state),
    pending: state.pending[FETCH_POSTS]
  })
)
export class ThreadsDropdown extends React.Component {

  static propTypes = {
    threads: array,
    pending: bool,
    newCount: number 
  }

  static contextTypes = {
    dispatch: func,
    currentUser: object
  }

  componentDidMount () {
    const { dispatch } = this.context
    this.socket = getSocket()
    this.socket.post(socketUrl('/noo/threads/subscribe'))
    this.socket.on('newThread', this.newThread.bind(this))
    this.socket.on('messageAdded', this.messageAdded.bind(this))
  }

  componentWillUnmount () {
    if (this.socket) {
      this.socket.post(socketUrl('/noo/threads/unsubscribe'))
      this.socket.off('newThread')
      this.socket.off('messageAdded')
    }
  }

  newThread (thread) {
    const { dispatch, currentUser } = this.context
    dispatch(appendThread(thread))
    dispatch(incrementUnreadThreads()) 
    this.forceUpdate()
  }

  messageAdded (data) {
    this.context.dispatch(appendComment(data.postId, data.message))
    // if the threads dropdown isn't open, increment the unread count
  }

  render () {
    const { threads, pending, newCount } = this.props
    const { dispatch } = this.context

    const resetCount = () =>
      dispatch(updateUserSettings({settings: {last_viewed_messages_at: new Date()}}))

    return <Dropdown alignRight rivalrous='nav' className='thread-list'
      onFirstOpen={() => dispatch(fetchPosts({ cacheId: 'threads', subject: 'threads' }))}
      onOpen={resetCount}
      toggleChildren={<span>
        <Icon name='Message-Smile'/>
        {newCount > 0 && <div className='badge'>{newCount}</div>}
      </span>}>
      {!pending && <li className='top'>
        <div className='newMessage' onClick={() => dispatch(showDirectMessage())}>
          <Icon name='Compose'/><span className='button-text'>New Message</span>
        </div>
      </li>}
      {pending && <li className='loading'>Loading...</li>}
      {threads.map(thread => <li key={thread.id}>
        <Thread thread={thread}/>
      </li>)}
    </Dropdown>
  }
}

const Thread = ({ thread }, { currentUser, dispatch }) => {
  const { comments, followers, last_read_at, updated_at } = thread
  const comment = comments[comments.length - 1]
  const unread = !last_read_at || new Date(updated_at) > new Date(last_read_at)
  const follower = followers.find(f => f.id !== currentUser.id)
  if (!comment || !follower) return null

  return <A to={threadUrl(thread.id)} className={cx({unread})}>
    {unread && <div className='dot-badge'/>}
    <NonLinkAvatar person={follower}/>
    <span>
      <strong>{follower.name}</strong>&nbsp;
      {comment.user_id === currentUser.id ? 'You: ' : ''}
      {comment.text}
    </span>
  </A>
}
Thread.contextTypes = {dispatch: func, currentUser: object}
