import React from 'react'
import { connect } from 'react-redux'
import { isEmpty } from 'lodash'
import { compact, flow, map, sortBy } from 'lodash/fp'
import cx from 'classnames'
import { threadUrl } from '../routes'
import { FETCH_POSTS, showDirectMessage, updateUserSettings } from '../actions'
import { fetchPosts } from '../actions/fetchPosts'
import { getComments, getPost, denormalizedPost } from '../models/post'
const { func, object } = React.PropTypes
import A from '../components/A'
import { NonLinkAvatar } from '../components/Avatar'
import Dropdown from '../components/Dropdown'
import Icon from '../components/Icon'

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

export const ThreadsDropdown = connect(
  (state, props) => ({
    threads: getThreads(state),
    pending: state.pending[FETCH_POSTS]
  })
)(props => {
  const { threads, dispatch, pending, newCount } = props
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
})

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
