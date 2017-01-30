import React from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import Avatar from './Avatar'
import Icon from './Icon'
import { STARTED_MESSAGE, trackEvent } from '../util/analytics'
import { showDirectMessage } from '../actions'
import { fetchPerson } from '../actions/people'
import { getPerson, sharesCommunity } from '../models/person'
import { truncate } from '../util/text'
const { object, func, string } = React.PropTypes

@connect((state, { userId }) => ({
  person: getPerson(userId, state)
}))
export default class PersonPopover extends React.Component {
  static propTypes = {
    userId: string,
    dispatch: func,
    person: object
  }

  componentDidMount () {
    const { dispatch, userId } = this.props
    dispatch(fetchPerson(userId))
  }

  render () {
    const { person, dispatch } = this.props

    if (!person) return null

    const bio = person.bio ? truncate(person.bio, 36) : ''

    const startMessage = () => {
      trackEvent(STARTED_MESSAGE, {context: 'popover'})
      return dispatch(showDirectMessage(person.id, person.name))
    }

    return <span className='person-popover'>
      <Avatar person={person} />
      <div className='name'><Link to={`/u/${person.id}`}>{person.name}</Link></div>
      <div className='bio'>{bio}</div>
      {sharesCommunity(person) && <button onClick={startMessage} className='message'>
        <Icon name='Message-Smile' /> Message
      </button>}
    </span>
  }
}
