import React from 'react'
import Avatar from './Avatar'
import A from './A'
import { humanDate, present } from '../util/text'
import { sanitize } from 'hylo-utils/text'
var { func, object } = React.PropTypes

class Message extends React.Component {
  static propTypes = {
    message: object.isRequired
  }

  static contextTypes = {
    dispatch: func.isRequired,
    currentUser: object
  }

  render () {
    const { message } = this.props

    const person = message.user
    let text = present(sanitize(message.text))

    return <div className='message' data-message-id={message.id}>
      <a name={`message-${message.id}`}></a>
      <Avatar person={person}/>
      <div className='content'>
        <div>
          <A to={`/u/${person.id}`}><strong className='name'>{sanitize(person.name)}</strong></A>
          <span className='date'>{humanDate(message.created_at)}</span>
        </div>
        <div className='text'>
          <span dangerouslySetInnerHTML={{__html: text}}/>
        </div>
      </div>
    </div>
  }
}

export default Message
