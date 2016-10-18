import React from 'react'
const { array, func } = React.PropTypes
import { VelocityTransitionGroup } from 'velocity-react'

export default class Notifier extends React.Component {
  static propTypes = {
    messages: array,
    remove: func
  }

  componentDidMount () {
    setInterval(() => {
      let now = Date.now()
      this.props.messages.filter(m => m.maxage && now > m.id + m.maxage)
      .forEach(m => this.props.remove(m.id))
    }, 500)
  }

  render () {
    let { messages, remove } = this.props
    return <div id='notifier'>
      <VelocityTransitionGroup
        enter={{animation: {translateX: [0, '-120%']}}}
        leave={{animation: {translateX: '-120%'}}}>
        {messages.map(m => <Message key={m.id} message={m} remove={remove}/>)}
      </VelocityTransitionGroup>
    </div>
  }
}

const className = messageType => {
  switch (messageType) {
    case 'error': return 'danger'
  }
  // bootstrap's standard types: success, info, warning, danger
  return messageType
}

const Message = ({ message, remove }) => {
  return <div className={`alert alert-${className(message.type)}`}>
    <a className='close' onClick={() => remove(message.id)}>&times;</a>
    <div>{message.text}</div>
  </div>
}
