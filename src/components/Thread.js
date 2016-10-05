import React from 'react'
import { filter } from 'lodash'
import { get } from 'lodash/fp'
const { array, bool, func, object, string } = React.PropTypes
import cx from 'classnames'
import {
  humanDate, nonbreaking, present, textLength, truncate, appendInP
} from '../util/text'
import MessageSection from './MessageSection'
import MessageForm from './MessageForm'
import PeopleTyping from './PeopleTyping'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { appendComment } from '../actions/comments'
import { getComments, getCommunities } from '../models/post'
import { getCurrentCommunity } from '../models/community'
import { getSocket, socketUrl } from '../client/websockets'
import config from '../config'
import decode from 'ent/decode'

const spacer = <span>&nbsp; •&nbsp; </span>

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
    const { post: { id }} = this.props
    const { dispatch } = this.context
    this.socket = getSocket()
    this.socket.post(socketUrl(`/noo/post/${id}/subscribe`))
    this.socket.on('commentAdded', c => dispatch(appendComment(id, c)))
  }

  componentWillUnmount () {
    const { post: { id }} = this.props
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
      <PeopleTyping showNames={true}/>
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
  const beyondTwo = followers.length - 2
  const { id } = currentUser
  const otherFollowers = filter(followers, f => f.id !== id)
  const title = otherFollowers.length > 1 ?
    `You, ${followers[0].name}, and ${beyondTwo} other${beyondTwo == 1 ? '' : 's'}` :
    `You and ${otherFollowers[0].name}`

  return <div className='header'>
    <div className='title'>{title}</div>
  </div>
}
Header.contextTypes = {
  post: object,
  currentUser: object
}
