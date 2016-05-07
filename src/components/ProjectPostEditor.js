import React from 'react'
import Icon from './Icon'
import DatetimePicker from 'react-datetime'
import { sanitizeTagInput } from '../util/textInput'
import { validateTag } from './EventPostEditor'
import { get } from 'lodash/fp'
import { getVideo } from '../models/post'
const { func, object } = React.PropTypes

export default class ProjectPostEditor extends React.Component {
  static propTypes = {
    postEdit: object,
    post: object,
    update: func.isRequired
  }

  static contextTypes = {dispatch: func}

  validate () {
    const { postEdit: { tag }, post } = this.props
    return tag === get('tag', post) ? true
      : validateTag(tag, this.context.dispatch)
  }

  render () {
    const { postEdit, update } = this.props
    const { end_time, tag, type } = postEdit
    const endTime = end_time ? new Date(end_time) : null
    const updateTag = tag => update({tag, tagEdited: true})
    const videoUrl = get('url', getVideo(postEdit))
    if (type !== 'project') setTimeout(() => update({type: 'project'}))

    return <div className='more-fields'>
      <div className='video'>
        <Icon name='film'/>
        <input type='text' placeholder='youtube or vimeo url'
          value={videoUrl}
          onChange={event => update({video: event.target.value})}/>
      </div>
      <div className='deadline'>
        <Icon name='calendar'/>
        <DatetimePicker inputProps={{placeholder: 'deadline'}}
          value={endTime}
          onChange={m => update({end_time: m.toISOString()})}/>
      </div>
      <div className='location'>
        <Icon name='map-marker'/>
        <input type='text' placeholder='location'
          defaultValue={postEdit.location}
          onChange={event => update({location: event.target.value})}/>
      </div>
      <div className='hashtag'>
        <span className='icon'>#</span>
        <input type='text' placeholder='hashtag' value={tag}
          onKeyPress={sanitizeTagInput}
          onChange={event => updateTag(event.target.value)}/>
      </div>
    </div>
  }
}
