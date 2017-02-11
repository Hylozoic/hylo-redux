
import React, { PropTypes } from 'react'
import { find, without } from 'lodash'
import { same } from '../../models'
import Dropdown from '../Dropdown'
import PersonDropdownItem from '../PersonDropdownItem'

export default function LinkedPersonSentence (
  { people, children, className, showPopover, onMouseOver },
  { currentUser, dispatch }
) {
  const me = find(people, same('id', currentUser))
  const others = me ? without(people, me) : people

  const numShown = 2
  const num = others.length
  const hasHidden = num > numShown
  const separator = threshold =>
    num > threshold
      ? ', '
      : num === threshold
        ? `${people.length === 2 ? '' : ','} and `
        : ''

  return <div className={className}>
    {me && <span className='person'>You</span>}
    {me && separator(1)}
    {others.slice(0, numShown).map((person, index) =>
      <span className='person' key={person.id} onMouseOver={showPopover ? onMouseOver : ''}>
        <a href={`/u/${person.id}`}>
          {person.name}
        </a>
        {index !== numShown - 1 && separator(2)}
      </span>)}
    {hasHidden && ', and '}
    {hasHidden && <Dropdown className='inline'
      toggleChildren={<span>
        {num - numShown} other{num - numShown > 1 ? 's' : ''}
      </span>}>
      {others.slice(numShown).map(p =>
        <PersonDropdownItem key={p.id} person={p} />)}
    </Dropdown>} {children}
  </div>
}
LinkedPersonSentence.propTypes = {
  people: PropTypes.array.isRequired,
  className: PropTypes.string,
  showPopover: PropTypes.bool,
  onMouseOver: PropTypes.func
}
LinkedPersonSentence.contextTypes = {
  currentUser: PropTypes.object
}
