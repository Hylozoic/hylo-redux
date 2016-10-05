import React from 'react'
import { values } from 'lodash'
import { getSocket } from '../client/websockets'
const { bool } = React.PropTypes

export default class PeopleTyping extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      peopleTyping: {}
    }
  }

  static propTypes = {
    showNames: bool
  }

  componentDidMount () {
    this.socket = getSocket() 
    this.socket.on('userTyping', this.userTyping.bind(this))
  }

  componentWillUnmount () {
    if (this.socket) this.socket.off('userTyping')
  }

  userTyping (data) {
    let newState = this.state
    if (data.isTyping) {
      newState.peopleTyping[data.userId] = data.userName
    } else {
      delete newState.peopleTyping[data.userId]
    }
    this.setState(newState)
  }

  render () {
    const { showNames } = this.props
    const names = values(this.state.peopleTyping)
    return names.length ? <div className='typing'>
      <Chillipsis/>
      {names.length === 1 && <div>
        {showNames ? names[0] : 'Someone'} is typing...
      </div>}
      {names.length > 1 && <div>Multiple people are typing...</div>}
    </div> : null
  }
}

const Chillipsis = () => {
  return <div className='chillipsis'>
    <div className='dot d1'></div>
    <div className='dot d2'></div>
    <div className='dot d3'></div>
  </div>
}
