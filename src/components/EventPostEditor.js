import React from 'react'
import { get } from 'lodash/fp'
import Icon from './Icon'
import DatetimePicker from 'react-datetime'
import { sanitizeTagInput } from '../util/textInput'
import { fetchTag } from '../actions'
const { func, object } = React.PropTypes

export const validateTag = (tag, dispatch) => {
  return dispatch(fetchTag(tag))
  .then(({ payload, error, meta: { tagName } }) => {
    if (error && get('response.status', payload) === 404) return true

    window.alert(`The tag "${tagName}" is already in use.`)
    return false
  })
}

export default class EventPostEditor extends React.Component {
  static propTypes = {
    postEdit: object,
    post: object,
    update: func.isRequired
  }

  static contextTypes = {dispatch: func}

  validate = () => {
    const { postEdit: { tag }, post } = this.props
    return tag === get('tag', post) ? true
      : validateTag(tag, this.context.dispatch)
  }

  render () {
    const { postEdit, update } = this.props
    const { start_time, end_time, tag, type } = postEdit
    if (type !== 'event') setTimeout(() => update({type: 'event'})) // smelly

    const startTime = start_time ? new Date(start_time) : null
    const endTime = end_time ? new Date(end_time) : null
    const updateTag = tag => update({tag, tagEdited: true})

    return <div className='more-fields'>
      <div className='start-time'>
        <Icon name='Calendar'/>
        <DatetimePicker inputProps={{placeholder: 'start time'}}
          value={startTime}
          onChange={m => update({start_time: m.toISOString()})}/>
      </div>
      <div className='end-time'>
        <Icon name='Calendar'/>
        <DatetimePicker inputProps={{placeholder: 'end time'}}
          value={endTime}
          onChange={m => update({end_time: m.toISOString()})}/>
      </div>
      <div className='location'>
        <Icon name='Pin-2'/>
        <input type='text' placeholder='location'
          defaultValue={postEdit.location}
          onChange={event => update({location: event.target.value})}/>
      </div>
      <div className='hashtag'>
          <Icon name='Tag' />
          <input type='text' placeholder='hashtag' value={tag}
          onKeyPress={sanitizeTagInput}
          onChange={event => updateTag(event.target.value)}/>
      </div>
    </div>
  }
}
