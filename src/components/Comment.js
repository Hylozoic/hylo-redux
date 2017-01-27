import React from 'react'
import Avatar from './Avatar'
import A from './A'
import Icon from './Icon'
import { some } from 'lodash'
import { get } from 'lodash/fp'
import { humanDate, prependInP, present, textLength } from '../util/text'
import { sanitize } from 'hylo-utils/text'
import { commentUrl } from '../routes'
import { removeComment, thank, updateCommentEditor } from '../actions/comments'
import truncateHtml from 'trunc-html'
import { ClickCatchingSpan } from './ClickCatcher'
import CommentForm from './CommentForm'
import Dropdown from './Dropdown'
import { canEditComment } from '../models/currentUser'
var { func, object, bool } = React.PropTypes

const spacer = <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
const truncatedLength = 200

class Comment extends React.Component {
  static propTypes = {
    community: object,
    comment: object.isRequired,
    truncate: bool,
    expand: func
  }

  static contextTypes = {
    dispatch: func.isRequired,
    currentUser: object
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    const { comment, truncate, expand, community } = this.props
    const { dispatch, currentUser } = this.context
    const { editing } = this.state

    const person = comment.user
    const { thank_ids } = comment
    const isThanked = some(thank_ids, id => id === get('id', currentUser))

    let text = present(sanitize(comment.text), {slug: get('slug', community)})
    const truncated = truncate && textLength(text) > truncatedLength
    if (truncated) text = truncateHtml(text, truncatedLength).html
    const name = sanitize(person.name).replace(/ /g, '&nbsp;')
    text = prependInP(text, `<a href='/u/${person.id}' class='name'>${name}</a>`)

    const remove = () => window.confirm('Delete this comment? This cannot be undone.') &&
      dispatch(removeComment(comment.id, comment.post_id))
    const edit = () => {
      this.setState({editing: true})
      return dispatch(updateCommentEditor(comment.id, comment.text, false))
    }
    const closeEdit = () => {
      this.setState({editing: false})
    }

    if (editing) return <CommentForm commentId={comment.id} close={closeEdit} />

    const { image } = comment

    return <div className='comment' data-comment-id={comment.id}>
      {canEditComment(currentUser, comment, community) &&
        <Dropdown alignRight toggleChildren={<Icon name='More' />}>
          {!image && <li><a onClick={edit}>Edit</a></li>}
          <li><a onClick={remove}>Remove</a></li>
        </Dropdown>}
      <a name={`comment-${comment.id}`} />
      <Avatar person={person} showPopover />
      <div className='content'>
        {image && <div className='text'><a href={`/u/${person.id}`} className='name'>{person.name}</a></div>}
        {image && <img className='thumbnail' src={image.thumbnail_url} />}
        {!image && <ClickCatchingSpan className='text' dangerouslySetInnerHTML={{__html: text}} />}
        {!image && truncated && <span> <a onClick={expand} className='show-more'>Show&nbsp;more</a></span>}
        <div>
          {currentUser && <span>
            {currentUser.id !== person.id &&
              <a className='thanks' onClick={() => dispatch(thank(comment.id, currentUser))}>
                {isThanked ? `You thanked ${person.name.split(' ')[0]}` : 'Say thanks'}
              </a>}
            {currentUser.id !== person.id && spacer}
          </span>}
          <A className='date' to={commentUrl(comment)}>{humanDate(comment.created_at)}</A>
        </div>
      </div>
    </div>
  }
}

export default Comment
