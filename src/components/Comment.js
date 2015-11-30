import React from 'react'
import Avatar from './Avatar'
import {humanDate, sanitize, present} from '../util/RichText'
var { object } = React.PropTypes

const spacer = <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>

export default class Comment extends React.Component {
  static propTypes = {
    comment: object
  }

  render () {
    let { comment } = this.props
    let person = comment.user
    let text = present(sanitize(comment.comment_text))

    return <div className='comment' data-comment-id={comment.id}>
      <Avatar person={person}/>
      <div className='content'>
        <strong>{person.name}</strong>
        <span className='meta'>
          {spacer}
          {humanDate(comment.created_at)}
        </span>
        <div className='text' dangerouslySetInnerHTML={{__html: text}}/>
      </div>
    </div>
  }
}
