import React from 'react'
import { Link } from 'react-router'
import cx from 'classnames'
const { object, func } = React.PropTypes
import { filter } from 'lodash'
import Avatar from './Avatar'
import Dropdown from './Dropdown'
import { changeEventResponse } from '../actions'

export default class RSVPControl extends React.Component {
  static propTypes = {
    currentUser: object,
    post: object,
    dispatch: func
  }

  render () {
    let { post, currentUser, dispatch } = this.props

    var respondersByType = [
      {title: 'Going', response: 'yes', responders: filter(post.responders, er => er.response === 'yes')},
      {title: 'Maybe', response: 'maybe', responders: filter(post.responders, er => er.response === 'maybe')},
      {title: 'Can\'t Go', response: 'no', responders: filter(post.responders, er => er.response === 'no')}
    ]
    var eventResponse = (filter(post.responders, responder => responder.id === currentUser.id)[0] || {response: ''}).response

    const pickResponse = choice => dispatch(changeEventResponse(post.id, choice, currentUser))

    const renderRSVPButton = (responderList) => {
      return (
        <button type='button' onClick={() => pickResponse(responderList.response)} className={cx(`rsvp-#{responderList.response}`, 'btn', 'btn-default', {'active': eventResponse === responderList.response})}>
          {responderList.title}
          {responderList.responders.length > 0 && ` (${responderList.responders.length})`}
        </button>
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

    const renderResponder = responder => {
      return (
        <li key={responder.id}>
          <span className='person'>
            <Avatar person={responder} /> <Link className='person' to={`/u/${responder.id}`}><span>{responder.name}</span></Link>
          </span>
        </li>
      )
    }

    return (
      <div className='rsvp-controls post-section'>
        <div className='btn-group buttons'>
          {respondersByType.map(renderRSVPButton)}
        </div>

        {post.responders.length > 0 && <div className='responses'>
          <Dropdown className='responses-dropdown' toggleChildren={<span>See Responses</span>}>
            {respondersByType.map(renderResponderList)}
          </Dropdown>
        </div>}
      </div>
    )
  }
}
