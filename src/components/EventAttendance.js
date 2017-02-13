import React, { PropTypes } from 'react'
import { get, find, isEmpty, some, sortBy } from 'lodash'
import cx from 'classnames'
import { same } from '../models'
import { changeEventResponse } from '../actions'
import Avatar from './Avatar'
import LinkedPersonSentence from './LinkedPersonSentence'
import Select from './Select'

export default function EventAttendance ({ post, limit, showButton, className, children }, { currentUser }) {
  const { responders } = post
  const going = sortBy(
    responders.filter(r => r.response === 'yes'),
    p => same('id', p, currentUser) ? 'Aaa' : p.name
  )
  return <div className={cx('attendance', className)}>
    {!isEmpty(going) && <LinkedPersonSentence people={going} className='blurb meta'>
      {going.length > 1 || some(going, same('id', currentUser)) ? 'are' : 'is'}
      &nbsp;going.
    </LinkedPersonSentence>}
    {going.length > 0 && <div className='going avatar-list'>
      {going.slice(0, limit).map(person =>
        <Avatar person={person} key={person.id} />)}
    </div>}
    {currentUser && showButton && <RSVPSelect post={post} />}
    {children}
  </div>
}
EventAttendance.contextTypes = {currentUser: PropTypes.object}

function RSVPSelect ({ post, alignRight }, { currentUser, dispatch }) {
  const options = [
    {name: "I'm Going", id: 'yes', className: 'yes'},
    {name: "Can't Go", id: 'no'}
  ]

  const onPickResponse = choice =>
    dispatch(changeEventResponse(post.id, choice.id, currentUser))

  const myResponse = find(post.responders, same('id', currentUser))
  const myResponseValue = get(myResponse, 'response') || ''
  const selected = myResponseValue === 'yes' ? options[0]
    : myResponseValue === 'no' ? options[1] : {name: 'RSVP'}

  return <Select className='rsvp' choices={options} selected={selected}
    alignRight={alignRight}
    onChange={onPickResponse} />
}
RSVPSelect.contextTypes = {currentUser: PropTypes.object, dispatch: PropTypes.func}
