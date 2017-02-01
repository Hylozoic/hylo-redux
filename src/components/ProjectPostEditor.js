import React from 'react'
import { connect } from 'react-redux'
import Icon from './Icon'
import DatetimePicker from 'react-datetime'
import { debounce } from 'lodash'
import { get, map, pick, filter } from 'lodash/fp'
import { getPost, getVideo } from '../models/post'
const { array, func, object } = React.PropTypes

const random = () => Math.random().toString().slice(2, 8)

const getSimplePost = state => id =>
  pick(['id', 'name', 'description', 'is_project_request'], getPost(id, state))

@connect((state, { postEdit }) => {
  if (postEdit.requests) return {requests: postEdit.requests}
  const children = map(getSimplePost(state), postEdit.children)
  const requests = filter(p => p.is_project_request, children)
  return {requests}
}, null, null, {withRef: true})
export default class ProjectPostEditor extends React.Component {
  static propTypes = {
    postEdit: object,
    post: object,
    update: func.isRequired,
    requests: array
  }

  static contextTypes = {dispatch: func}

  componentDidMount () {
    // we update the store as soon as the component is mounted in order to load
    // data from the existing requests into the postEdit. otherwise, if we
    // didn't change them and then saved the post, they would be removed.
    const { update, requests } = this.props
    update({requests})
  }

  addRequest = () => {
    const { update, requests } = this.props
    update({requests: [...requests, {id: `new-${random()}`}]})
  }

  updateRequest = index => (key, value) => {
    const updatedRequest = {...this.props.requests[index], [key]: value}
    const requests = this.props.requests.slice()
    requests.splice(index, 1, updatedRequest)
    this.props.update({requests})
  }

  render () {
    const { postEdit, update, requests } = this.props
    const { ends_at, type } = postEdit
    const endsAt = ends_at ? new Date(ends_at) : null
    const videoUrl = get('url', getVideo(postEdit)) || ''
    if (type !== 'project') setTimeout(() => update({type: 'project'}))

    return <div className='project-editor'>
      <h3>
        Requests
        <span className='soft normal'>&nbsp;&mdash; what you need to make it happen</span>
      </h3>
      <div className='requests'>
        {requests.map((p, i) => <ProjectRequestEditor post={p} key={p.id}
          update={this.updateRequest(i)} />)}
        <a className='add-request' onClick={this.addRequest}>+ Add request</a>
      </div>
      <div className='more-fields'>
        <div className='video'>
          <Icon name='VideoCamera' />
          <input type='text' placeholder='youtube or vimeo url'
            value={videoUrl}
            onChange={event => update({video: event.target.value})} />
        </div>
        <div className='deadline'>
          <Icon name='Calendar' />
          <DatetimePicker inputProps={{placeholder: 'deadline'}}
            value={endsAt}
            onChange={m => update({ends_at: m.toISOString()})} />
        </div>
        <div className='location'>
          <Icon name='Pin-1' />
          <input type='text' placeholder='location'
            defaultValue={postEdit.location}
            onChange={event => update({location: event.target.value})} />
        </div>
      </div>
    </div>
  }
}

import AutosizingTextarea from './AutosizingTextarea'
import RichTextEditor from './RichTextEditor'
import cx from 'classnames'

class ProjectRequestEditor extends React.Component {
  static propTypes = {
    post: object,
    update: func
  }

  constructor (props) {
    super(props)
    this.state = pick(['name', 'description'], props.post)
  }

  goToDetails = () => {
    this.setState({showDetails: true})
    this.refs.details.focus()
  }

  delayedUpdate = debounce(function (attr, value) {
    return this.props.update(attr, value)
  }, 100)

  render () {
    const { post: { id } } = this.props
    const { name, description } = this.state
    const handleChange = attr => event => {
      const { value } = event.target
      this.setState({[attr]: value})
      this.delayedUpdate(attr, value)
    }

    const showDetails = this.state.showDetails || !!description
    const editorClass = cx('details', {empty: !showDetails})

    return <div>
      <div className='title-wrapper'>
        <AutosizingTextarea type='text' ref='title' className='title'
          value={name}
          placeholder='What do you need help with?'
          onChange={handleChange('name')} />
      </div>

      <RichTextEditor className={editorClass} ref='details' name={`post-${id}`}
        content={description}
        onChange={handleChange('description')}
        onBlur={() => this.setState({showDetails: false})} />
      {!showDetails &&
        <div className='details-placeholder' onClick={this.goToDetails}>
          More details
        </div>}
    </div>
  }
}
