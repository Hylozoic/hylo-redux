import React from 'react'
import { filter } from 'lodash'
import { get } from 'lodash/fp'
const { array, func, object } = React.PropTypes
import cx from 'classnames'
import MessageSection from './MessageSection'
import MessageForm from './MessageForm'
import PeopleTyping from './PeopleTyping'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { appendComment } from '../actions/comments'
import { getComments } from '../models/post'
import { getSocket, socketUrl } from '../client/websockets'

class Thread extends React.Component {
  static propTypes = {
    post: object,
    messages: array
  }

  static contextTypes = {
    dispatch: func
  }

  static childContextTypes = {post: object}

  getChildContext () {
    return {post: this.props.post}
  }

  componentDidMount () {
    this.socket = getSocket()
    this.subscribe(this.props.post.id)
  }

  componentWillUnmount () {
    this.unsubscribe(this.props.post.id)
  }

  componentWillReceiveProps (nextProps) {
    const oldId = get('post.id', this.props)
    const newId = get('post.id', nextProps)
    if (newId !== oldId) {
      if (oldId) this.unsubscribe(oldId)
      this.subscribe(newId)
    }
  }

  subscribe (id) {
    this.socket.post(socketUrl(`/noo/post/${id}/subscribe`))
    this.socket.on('commentAdded', c =>
      this.context.dispatch(appendComment(id, c)))
  }

  unsubscribe (id) {
    if (this.socket) {
      this.socket.post(socketUrl(`/noo/post/${id}/unsubscribe`))
      this.socket.off('commentAdded')
    }
  }

  render () {
    const { post, messages } = this.props
    const classes = cx('thread')

    return <div className={classes}>
      <Header />
      <MessageSection {...{post, messages}}/>
      <PeopleTyping showNames/>
      <MessageForm postId={post.id} />
    </div>
  }
}

export default compose(
  connect((state, { post }) => {
    return {
      messages: getComments(post, state)
    }
  })
)(Thread)

export const Header = (props, { currentUser, post }) => {
  const followers = post.followers
  const gt2 = followers.length - 2
  const { id } = currentUser
  const otherFollowers = filter(followers, f => f.id !== id)
  const title = otherFollowers.length > 1
    ? `You, ${followers[0].name}, and ${gt2} other${gt2 === 1 ? '' : 's'}`
    : `You and ${otherFollowers[0].name}`

  return <div className='header'>
    <div className='title'>{title}</div>
  </div>
}
Header.contextTypes = {
  post: object,
  currentUser: object
}
