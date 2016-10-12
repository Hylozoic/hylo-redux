import React from 'react'
import { filter } from 'lodash'
import { get } from 'lodash/fp'
const { array, func, object } = React.PropTypes
import cx from 'classnames'
import MessageSection from './MessageSection'
import MessageForm from './MessageForm'
import PeopleTyping from './PeopleTyping'
import { connect } from 'react-redux'
import { updatePostReadTime } from '../actions/posts'
import { getComments } from '../models/post'

@connect((state, { post }) => ({
  messages: getComments(post, state)
}))
export default class Thread extends React.Component {
  static propTypes = {
    post: object,
    messages: array,
    dispatch: func
  }

  static childContextTypes = {post: object}

  getChildContext () {
    return {post: this.props.post}
  }

  componentDidMount () {
    const { post } = this.props
    this.markAsRead(post)
  }

  componentWillReceiveProps (nextProps) {
    const oldId = get('post.id', this.props)
    const newId = get('post.id', nextProps)
    if (newId !== oldId) {
      this.markAsRead(nextProps.post)
    }
  }

  markAsRead (post) {
    const { dispatch, post: { id } } = this.props
    dispatch(updatePostReadTime(id))
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
Header.contextTypes = {post: object, currentUser: object}
