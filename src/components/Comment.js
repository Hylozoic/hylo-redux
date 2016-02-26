import React from 'react'
import Avatar from './Avatar'
import A from './A'
import ClickCatchingDiv from './ClickCatchingDiv'
import {humanDate, sanitize, present} from '../util/text'
import { commentUrl } from '../routes'
var { object } = React.PropTypes

const spacer = <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>

const Comment = ({ comment, displayMode }) => {
  let person = comment.user
  let text = present(sanitize(comment.comment_text))

  return <div className='comment' data-comment-id={comment.id}>
    <a name={`comment-${comment.id}`}></a>
    <Avatar person={person}/>
    <div className='content'>
      <strong>{person.name}</strong>
      <span className='meta'>
        {spacer}
        {humanDate(comment.created_at)}
        {displayMode === 'search' && <span>
          {spacer}
          <A to={commentUrl(comment)}>View in context</A>
        </span>}
      </span>
      <ClickCatchingDiv className='text' dangerouslySetInnerHTML={{__html: text}}/>
    </div>
  </div>
}

Comment.propTypes = {
  comment: object.isRequired
}

export default Comment
