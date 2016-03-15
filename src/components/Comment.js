import React from 'react'
import { isEmpty } from 'lodash'
import Avatar from './Avatar'
import A from './A'
import ClickCatchingDiv from './ClickCatchingDiv'
import {humanDate, sanitize, present} from '../util/text'
import { commentUrl } from '../routes'
import { thank } from '../actions'
import Dropdown from './Dropdown'
import PersonDropdownItem from './PersonDropdownItem'
var { func, object } = React.PropTypes

const spacer = <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>

const Comment = ({ comment }, { dispatch, currentUser }) => {
  let person = comment.user
  let text = present(sanitize(comment.text))
  let { isThanked, thanks } = comment

  return <div className='comment' data-comment-id={comment.id}>
    <a name={`comment-${comment.id}`}></a>
    <Avatar person={person}/>
    <div className='content'>
      <strong>{person.name}</strong>
      <span className='meta'>
        {spacer}
        <A to={commentUrl(comment)}>{humanDate(comment.created_at)}</A>
        {currentUser && <span>
          {(currentUser.id !== person.id || !isEmpty(thanks)) && spacer}
          {currentUser.id !== person.id &&
            <a onClick={() => dispatch(thank(comment.id, currentUser))}>
              {isThanked ? `You thanked ${person.name.split(' ')[0]}` : 'Say thanks'}
            </a>}
          {!isEmpty(thanks) && <Dropdown className='inline'
            toggleChildren={<span>
              &nbsp;
              {currentUser.id !== person.id
                ? `(${thanks.length})`
                : `${thanks.length} thanks`}
            </span>}>
            {thanks.map(p => <PersonDropdownItem key={p.id} person={p}/>)}
          </Dropdown>}
        </span>}
      </span>
      <ClickCatchingDiv className='text' dangerouslySetInnerHTML={{__html: text}}/>
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
