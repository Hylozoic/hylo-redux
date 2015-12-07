import React from 'react'
import { Link } from 'react-router'
import cx from 'classnames'
const { object, func } = React.PropTypes
import { filter } from 'lodash'
import Avatar from './Avatar'
import Dropdown from './Dropdown'

const renderRSVPButton = (eventResponse, responderList, onPickResponse) => {
  return (
    <button type='button' onClick={() => onPickResponse(responderList.response)} className={cx(`rsvp-#{responderList.response}`, 'btn', 'btn-default', {'active': eventResponse === responderList.response})}>
      {responderList.title}
      {responderList.responders.length > 0 && ` (${responderList.responders.length})`}
    </button>
  )
}

const renderResponder = responder => {
  return (
    <li key={responder.id}>
      <span className='person'>
        <Avatar person={responder} /> <Link className='person' to={`/u/${responder.id}`}><span>{responder.name}</span></Link>
      </span>
    </li>
  )
}

const renderResponderList = responderList => {
  if (responderList.responders.length === 0) return
  return (
    <span key={responderList.title}>
      <li className='header'>
        <span className='header'>{responderList.title}</span>
      </li>
      {responderList.responders.map(renderResponder)}
    </span>
  )
}

export default class RSVPControl extends React.Component {
  static propTypes = {
    currentUser: object,
    post: object,
    dispatch: func
  }

  render () {
    let { responders, onPickResponse, currentResponse } = this.props

    var respondersByType = [
      {title: 'Going', response: 'yes', responders: filter(responders, er => er.response === 'yes')},
      {title: 'Maybe', response: 'maybe', responders: filter(responders, er => er.response === 'maybe')},
      {title: 'Can\'t Go', response: 'no', responders: filter(responders, er => er.response === 'no')}
    ]

    return (
      <div className='rsvp-controls post-section'>
        <div className='btn-group buttons'>
          {respondersByType.map(rl => renderRSVPButton(currentResponse, rl, onPickResponse))}
        </div>

        {responders.length > 0 && <div className='responses'>
          <Dropdown className='responses-dropdown' toggleChildren={<span>See Responses</span>}>
            {respondersByType.map(renderResponderList)}
          </Dropdown>
        </div>}
      </div>
    )
  }
}
