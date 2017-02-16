import React from 'react'
import cx from 'classnames'
import Avatar from './Avatar'
import ImageWithFallback from './ImageWithFallback'
import { showImage } from '../actions/ui'
import { humanDate, present } from '../util/text'
import { sanitize } from 'hylo-utils/text'
var { func, object, bool } = React.PropTypes

class Message extends React.Component {
  static propTypes = {
    message: object.isRequired,
    isHeader: bool
  }

  static contextTypes = {
    dispatch: func.isRequired,
    currentUser: object,
    location: object,
    isMobile: bool
  }

  render () {
    const { message, message: { image }, isHeader } = this.props
    const { dispatch, location, isMobile } = this.context

    const person = message.user
    const notPending = message.id.slice(0,4) === 'post' ? null : true
    let text = present(sanitize(message.text).replace(/\n/g, '<br />'), {noP: true})

    return <div className={cx('message', {messageHeader: isHeader})}
      data-message-id={message.id}>
      {isHeader && <Avatar person={person} />}
      <div className='content'>
        {isHeader && <div>
          <strong className='name'>{sanitize(person.name)}</strong>
          <span className='date'>{notPending ? humanDate(message.created_at) : 'sending...'}</span>
        </div>}
        {image
        ? <a onClick={() => dispatch(showImage(image.url, location.pathname, isMobile))}>
          <ImageWithFallback className='thumbnail' preferredSrc={image.thumbnail_url} fallbackSrc={image.url} onlyUsePreferred={!message.fromTemp} />
        </a>
        : <div className='text'>
          <span dangerouslySetInnerHTML={{__html: text}} />
        </div>}
      </div>
    </div>
  }
}

export default Message
