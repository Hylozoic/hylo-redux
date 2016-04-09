import React from 'react'
import Avatar from './Avatar'
import A from './A'
import { humanDate, sanitize, prependInP, present, textLength } from '../util/text'
import { commentUrl } from '../routes'
import { thank } from '../actions'
import truncateHtml from 'html-truncate'
import { ClickCatchingSpan } from './ClickCatcher'
var { func, object } = React.PropTypes

const spacer = <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
const truncatedLength = 220

const Comment = ({ comment, truncate, expand }, { dispatch, currentUser }) => {
  const person = comment.user
  const { isThanked } = comment
  let text = present(sanitize(comment.text))
  const truncated = truncate && textLength(text) > truncatedLength
  if (truncated) text = truncateHtml(text, truncatedLength)
  text = prependInP(text, `<strong class='name'>${person.name}</strong>`)

  return <div className='comment' data-comment-id={comment.id}>
    <a name={`comment-${comment.id}`}></a>
    <Avatar person={person}/>
    <div className='content'>
      <ClickCatchingSpan className='text' dangerouslySetInnerHTML={{__html: text}}/>
      {truncated && <span> <a onClick={expand}>Show&nbsp;more</a></span>}
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
