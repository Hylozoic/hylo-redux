import React from 'react'
import { debounce } from 'lodash'
import Icon from './Icon'
import DatetimePicker from 'react-datetime'
import { getCharacter } from '../util/textInput'
const { func, object } = React.PropTypes
import { hashtagCharacterRegex } from '../models/hashtag'
import { fetchTag } from '../actions'

const sanitizeTagInput = event =>
  getCharacter(event).match(hashtagCharacterRegex) || event.preventDefault()

export default class EventPostEditor extends React.Component {
  static propTypes = {
    postEdit: object,
    update: func.isRequired
  }

  static contextTypes = {
    dispatch: func
  }

  constructor (props) {
    super(props)
    let tag = props.postEdit.tag
    this.state = {tag: tag !== 'chat' ? tag : null}
  }

  validate () {
    const tag = this.state.tag || this.props.postEdit.tag
    return this.context.dispatch(fetchTag(tag))
    .then(({ payload, meta: { tagName } }) => {
      if (!payload) return true

      window.alert(`The tag "${tagName}" is already in use.`)
      return false
    })
  }

  render () {
    const { postEdit, update } = this.props
    const { start_time, end_time } = postEdit
    const startTime = start_time ? new Date(postEdit.start_time) : null
    const endTime = end_time ? new Date(postEdit.end_time) : null
    const updateSlowly = debounce(update, 200)
    const tag = this.state.tag || postEdit.tag

    const updateTag = event => {
      const { target: { value } } = event
      this.setState({tag: value})
      updateSlowly({tag: value, tagManuallyEdited: true})
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
          onKeyPress={sanitizeTagInput}
          onChange={updateTag}/>
      </div>
    </div>
  }
}
