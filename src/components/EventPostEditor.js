import React from 'react'
import { get } from 'lodash/fp'
import Icon from './Icon'
import DatetimePicker from 'react-datetime'
const { func, object } = React.PropTypes

export default class EventPostEditor extends React.Component {
  static propTypes = {
    postEdit: object,
    post: object,
    update: func.isRequired
  }

  static contextTypes = {dispatch: func}
  
  validate = () => true

  render () {
    const { postEdit, update } = this.props
    const { starts_at, ends_at, type } = postEdit
    if (type !== 'event') setTimeout(() => update({type: 'event'})) // smelly

    const startsAt = starts_at ? new Date(starts_at) : ''
    const endsAt = ends_at ? new Date(ends_at) : ''
    const updateTime = name => time => {
      if (time._isAMomentObject) update({[name]: time.toISOString()})
    }

    return <div className='more-fields'>
      <div className='start-time'>
        <Icon name='Calendar'/>
        <DatetimePicker inputProps={{placeholder: 'start time'}}
          defaultValue={startsAt}
          onBlur={updateTime('starts_at')}/>
      </div>
      <div className='end-time'>
        <Icon name='Calendar'/>
        <DatetimePicker inputProps={{placeholder: 'end time'}}
          defaultValue={endsAt}
          onBlur={updateTime('ends_at')}/>
      </div>
      <div className='location'>
        <Icon name='Pin-1'/>
        <input type='text' placeholder='location'
          defaultValue={postEdit.location}
          onChange={event => update({location: event.target.value})}/>
      </div>
    </div>
  }
}
