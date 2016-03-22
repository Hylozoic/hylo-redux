import React from 'react'
import Avatar from './Avatar'
import A from './A'
import {humanDate, sanitize, present} from '../util/text'
import { commentUrl } from '../routes'
import { thank } from '../actions'
var { func, object } = React.PropTypes

const spacer = <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>

const Comment = ({ comment, expand }, { dispatch, currentUser }) => {
  let person = comment.user
  let text = present(sanitize(comment.text))
  let { isThanked } = comment

  return <div className='comment' data-comment-id={comment.id}>
    <a name={`comment-${comment.id}`}></a>
    <Avatar person={person}/>
    <div className='content'>
      <strong className='name'>{person.name}</strong>
      <span className='text' dangerouslySetInnerHTML={{__html: text}} />
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
