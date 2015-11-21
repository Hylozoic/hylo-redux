import React from 'react'
import Avatar from './Avatar'
import {humanDate, sanitize, present} from '../util/RichText'
var {object} = React.PropTypes

const spacer = <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>

export default class Comment extends React.Component {
  static propTypes = {
    comment: object
  }

  render () {
    let {comment} = this.props
    let text = present(sanitize(comment.comment_text))

    return <div className='comment'>
      <Avatar user={comment.user}/>
      <div className='content'>
        <strong>{comment.user.name}</strong>
        <span className='meta'>
          {spacer}
          {humanDate(comment.created_at)}
        </span>
        <div className='text' dangerouslySetInnerHTML={{__html: text}}/>
      </div>
    </div>
  }
}
