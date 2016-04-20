import React from 'react'
import { debounce, has, startCase } from 'lodash'
import Icon from './Icon'
import DatetimePicker from 'react-datetime'
import { getKeyCode, keyMap } from '../util/textInput'
const { func, object } = React.PropTypes

const suggestedTag = text =>
  startCase(text).split(' ').slice(0, 4).join('')

const sanitize = event => {
  const keyCode = getKeyCode(event)
  if (keyCode === keyMap.SPACE) event.preventDefault()
}

export default class EventPostEditor extends React.Component {
  static propTypes = {
    postEdit: object,
    update: func.isRequired
  }

  constructor (props) {
    super(props)
    let tag = props.postEdit.tag
    // don't set it at all if it's blank or the default value, because its
    // absence is used below to determine whether we should show the suggested
    // tag
    if (tag && tag !== 'chat') {
      this.state = {tag}
    } else {
      this.state = {}
    }
  }

  render () {
    const { postEdit, update } = this.props
    const { name, start_time, end_time } = postEdit
    const startTime = start_time ? new Date(postEdit.start_time) : null
    const endTime = end_time ? new Date(postEdit.end_time) : null
    const updateSlowly = debounce(update, 200)

    const tag = has(this.state, 'tag') ? this.state.tag : suggestedTag(name)

    const updateTag = event => {
      const { target: { value } } = event
      this.setState({changedTagField: true, tag: value})
      updateSlowly({tag: value})
    }

    return <div className='event-section'>
      <div className='start-time'>
        <Icon name='calendar'/>
        <DatetimePicker inputProps={{placeholder: 'start time'}}
          value={startTime}
          onChange={m => update({start_time: m.toISOString()})}/>
      </div>
      <div className='end-time'>
        <Icon name='calendar'/>
        <DatetimePicker inputProps={{placeholder: 'end time'}}
          value={endTime}
          onChange={m => update({end_time: m.toISOString()})}/>
      </div>
      <div className='location'>
        <Icon name='map-marker'/>
        <input type='text' placeholder='location'
          defaultValue={postEdit.location}
          onChange={event => updateSlowly({location: event.target.value})}/>
      </div>
      <div className='hashtag'>
        <span className='icon'>#</span>
        <input type='text' placeholder='hashtag' value={tag}
          onKeyDown={sanitize}
          onKeyUp={sanitize}
          onChange={updateTag}/>
      </div>
    </div>
  }
}
