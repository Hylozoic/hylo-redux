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
    var props = this.props
    let { post, currentUser } = props

    var yeses = filter(post.responders, er => er.response === 'yes')
    var maybes = filter(post.responders, er => er.response === 'maybe')
    var nos = filter(post.responders, er => er.response === 'no')
    var eventResponse = (filter(post.responders, responder => responder.id === currentUser.id)[0] || {response: ''}).response
    var yesHeader = {header: 'Going', id: -1}
    var maybeHeader = {header: 'Maybe', id: -2}
    var noHeader = {header: 'Can\'t Go', id: -3}

    var responderList = []
    if (yeses.length > 0) {
      responderList.push(yesHeader)
      responderList = responderList.concat(yeses)
    }
    if (maybes.length > 0) {
      responderList.push(maybeHeader)
      responderList = responderList.concat(maybes)
    }
    if (nos.length > 0) {
      responderList.push(noHeader)
      responderList = responderList.concat(nos)
    }

    var eventResponseClicked = function (response) {
      return e => {
        props.dispatch(changeEventResponse(post.id, response, currentUser))
      }
    }

    return (
      <div className='rsvp-controls post-section'>
        <div className='btn-group buttons'>
          <button type='button' onClick={eventResponseClicked('yes')} className={cx('rsvp-yes', 'btn', 'btn-default', {'active': eventResponse === 'yes'})}>
            Going
            {yeses.length > 0 && ` (${yeses.length})`}
          </button>
          <button type='button' onClick={eventResponseClicked('maybe')} className={cx('rsvp-maybe', 'btn', 'btn-default', {'active': eventResponse === 'maybe'})}>
            Maybe
            {maybes.length > 0 && ` (${maybes.length})`}
          </button>
          <button type='button' onClick={eventResponseClicked('no')} className={cx('rsvp-no', 'btn', 'btn-default', {'active': eventResponse === 'no'})}>
            {"Can't Go"}
            {nos.length > 0 && ` (${nos.length})`}
          </button>
        </div>

        {post.responders.length > 0 && <div className='responses'>

          <Dropdown className='responses-dropdown' toggleChildren={<span>See Responses</span>}>
            {responderList.map(personOrHeader => <li key={personOrHeader.id} className={personOrHeader.header ? 'header' : ''}>
              {personOrHeader.header
                ? <span className='header'>{personOrHeader.header}</span>
                : <span className='person'>
                <Avatar person={personOrHeader} /> <Link className='person' to={`/u/${personOrHeader.id}`}><span>{personOrHeader.name}</span></Link>
              </span>}
            </li>)}
          </Dropdown>
        </div>}
      </div>
    )
  }
}
