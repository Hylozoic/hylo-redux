import React from 'react'
import cx from 'classnames'
import Avatar from './Avatar'
import { showModal } from '../actions'
import { humanDate } from '../util/text'
import { sanitize } from 'hylo-utils/text'
var { func, object, bool } = React.PropTypes

class Message extends React.Component {
  static propTypes = {
    message: object.isRequired,
    isHeader: bool
  }

  static contextTypes = {
    dispatch: func.isRequired,
    currentUser: object
  }

  render () {
    const { message, message: { image }, isHeader } = this.props
    const { dispatch } = this.context

    const person = message.user
    let text = sanitize(message.text).replace(/\n/g, '<br />')

    return <div className={cx('message', {messageHeader: isHeader})}
      data-message-id={message.id}>
      {isHeader && <Avatar person={person} />}
      <div className='content'>
        {isHeader && <div>
          <strong className='name'>{sanitize(person.name)}</strong>
          <span className='date'>{humanDate(message.created_at)}</span>
        </div>}
        {image
        ? <a onClick={() => dispatch(showModal('image', {url: image.url}))}>
          <img className='thumbnail' src={image.thumbnail_url} />
        </a>
        : <div className='text'>
          <span dangerouslySetInnerHTML={{__html: text}} />
        </div>}
      </div>
    </div>
  }
}

export default Message
