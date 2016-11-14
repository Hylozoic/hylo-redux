import React from 'react'
import { filter } from 'lodash'
import { get, map, min } from 'lodash/fp'
const { array, bool, func, object } = React.PropTypes
import cx from 'classnames'
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

  setupForThread (post) {
    this.props.dispatch(onThreadPage(post.id))
    if (this.socket) {
      this.socket.post(socketUrl(`/noo/post/${post.id}/subscribe`)) // for people typing
    }
    this.refs.form.getWrappedInstance().focus()
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
        this.socket.post(socketUrl(`/noo/post/${oldId}/unsubscribe`))
      }
      this.setupForThread(nextProps.post)
    }
  }

  componentWillUnmount () {
    const postId = get('post.id', this.props)
    this.props.dispatch(offThreadPage())
    if (this.socket) {
      this.socket.post(socketUrl(`/noo/post/${postId}/unsubscribe`))
    }
  }

  render () {
    const { post, messages, pending, dispatch } = this.props
    const classes = cx('thread')
    const loadMore = () => {
      if (pending || messages.length >= post.numComments) return
      const beforeId = min(map('id', messages))
      dispatch(fetchComments(post.id, {refresh: true, newest: true, limit: 20, beforeId}))
      .then(() => this.refs.messageSection.scrollToMessage(beforeId))
    }

    return <div className={classes}>
      <Header />
      <MessageSection {...{messages, pending}} thread={post} onScrollToTop={loadMore} ref='messageSection'/>
      <PeopleTyping showNames/>
      <MessageForm postId={post.id} ref='form'/>
    </div>
  }
}

export const Header = (props, { currentUser, post }) => {
  const followers = post.followers
  const gt2 = followers.length - 2
  const { id } = currentUser
  const others = filter(followers, f => f.id !== id)

  return <div className='header'>
    <div className='title'>
      You and <A to={`/u/${others[0].id}`}>{others[0].name}</A>
      {others.length > 1 && <span>and ${gt2} other{gt2 === 1 ? '' : 's'}</span>}
    </div>
  </div>
}
Header.contextTypes = {post: object, currentUser: object}
