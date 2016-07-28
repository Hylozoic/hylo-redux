import React from 'react'
import Avatar from './Avatar'
import A from './A'
import { some } from 'lodash'
import { get } from 'lodash/fp'
import { same } from '../models'
import { humanDate, sanitize, prependInP, present, textLength } from '../util/text'
import { commentUrl } from '../routes'
import { removeComment, thank } from '../actions'
import truncateHtml from 'html-truncate'
import { ClickCatchingSpan } from './ClickCatcher'
import { canEditComment } from '../models/currentUser'
var { func, object } = React.PropTypes

const spacer = <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
const truncatedLength = 220

const Comment = ({ comment, truncate, expand, community }, { dispatch, currentUser }) => {
  const person = comment.user
  const { thanks } = comment
  const isThanked = comment.isThanked || some(thanks, same('id', currentUser))
  let text = present(sanitize(comment.text), {slug: get('slug', community)})
  const truncated = truncate && textLength(text) > truncatedLength
  if (truncated) text = truncateHtml(text, truncatedLength)
  text = prependInP(text, `<a href='/u/${person.id}'><strong class='name'>${sanitize(person.name)}</strong></a>`)
  const remove = () => window.confirm('Delete this comment? This cannot be undone.') &&
    dispatch(removeComment(comment.id))

  return <div className='comment' data-comment-id={comment.id}>
    {canEditComment(currentUser, comment, community) &&
      <a className='delete' onClick={remove}>&times;</a>}
    <a name={`comment-${comment.id}`}></a>
    <Avatar person={person}/>
    <div className='content'>
      <ClickCatchingSpan className='text' dangerouslySetInnerHTML={{__html: text}}/>
      {truncated && <span> <a onClick={expand} className='show-more'>Show&nbsp;more</a></span>}
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

Comment.propTypes = {
  comment: object.isRequired
}

Comment.contextTypes = {
  dispatch: func.isRequired,
  currentUser: object
}

export default Comment
