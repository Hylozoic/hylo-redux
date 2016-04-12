import React from 'react'
import cx from 'classnames'
const { object, func, array, string } = React.PropTypes
import { filter, flattenDeep, some } from 'lodash'
import Dropdown from './Dropdown'
import PersonDropdownItem from './PersonDropdownItem'

const RSVPButton = props => {
  let { currentResponse, responderList, onPickResponse } = props
  let { response, title, responders } = responderList
  let classes = cx(`rsvp-${response} btn btn-default`, {'active': currentResponse === response})
  return <button onClick={() => onPickResponse(response)} className={classes}>
    {title}
    {responders.length > 0 && ` (${responders.length})`}
  </button>
}

const RSVPControl = props => {
  const { responders, onPickResponse, currentResponse } = props
  const is = value => x => x.response === value
  const groups = [
    {title: 'Going', response: 'yes', responders: filter(responders, is('yes'))},
    {title: 'Maybe', response: 'maybe', responders: filter(responders, is('maybe'))},
    {title: 'Can\'t Go', response: 'no', responders: filter(responders, is('no'))}
  ]
  const nonEmptyGroups = filter(groups, x => some(x.responders))

  return <div className='rsvp-controls'>
    {onPickResponse && <div className='btn-group buttons'>
      {groups.map(rl =>
        <RSVPButton currentResponse={currentResponse}
          responderList={rl}
          onPickResponse={onPickResponse}
          key={rl.response}/>)}
    </div>}

    {responders.length > 0 && <div className='responses'>
      <Dropdown className='responses-dropdown'
        toggleChildren={<span>See Responses</span>}>
        {flattenDeep(nonEmptyGroups.map(rl => [
          <li className='group-name' key={`group-${rl.response}`}>{rl.title}</li>,
          rl.responders.map(r => <PersonDropdownItem person={r} key={r.id}/>)
        ]))}
      </Dropdown>
    </div>}
  </div>
}

RSVPControl.propTypes = {
  responders: array,
  currentUser: object,
  post: object,
  onPickResponse: func,
  currentResponse: string
}

export default RSVPControl
