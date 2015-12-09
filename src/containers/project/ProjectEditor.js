import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import {
  UPDATE_PROJECT,
  UPLOAD_IMAGE,
  fetchProject,
  navigate,
  removeImage,
  updateProjectEditor,
  updateProjectVideo,
  updateProject
} from '../../actions'
import { uploadImage } from '../../actions/uploadImage'
import ImageAttachmentButton from '../../components/ImageAttachmentButton'
import { find, isEmpty } from 'lodash'
const { bool, func, object, string } = React.PropTypes

@prefetch(({ dispatch, params: { id } }) => {
  if (id) return dispatch(fetchProject(id))
  // TODO
})
@connect(({ projects, projectEdits, pending, people }, { params: { id } }) => {
  let project = projects[id]

  // copy the project when the edit starts -- don't need to save it
  // elsewhere in the store until something is actually changed
  let projectEdit = {...project, ...projectEdits[id]}

  return {
    id,
    project,
    projectEdit,
    pending: pending[UPDATE_PROJECT],
    imagePending: pending[UPLOAD_IMAGE],
    currentUser: people.current
  }
})
export default class ProjectEditor extends React.Component {
  static propTypes = {
    project: object,
    projectEdit: object,
    dispatch: func,
    id: string,
    pending: bool,
    imagePending: bool,
    currentUser: object
  }

  componentDidMount () {
    let { dispatch, id, projectEdit } = this.props
    let { media } = projectEdit || {}

    if (!isEmpty(media)) {
      // we have to initialize project media in the edit store; otherwise,
      // the first video update will drop the image and vice versa
      dispatch(updateProjectEditor(id, {media}))
    }
  }

  update = field => event => {
    let { dispatch, id } = this.props
    dispatch(updateProjectEditor(id, {[field]: event.target.value}))
  }

  updateVideo = event => {
    let { dispatch, id } = this.props
    dispatch(updateProjectVideo(id, event.target.value))
  }

  attachImage = () => {
    let { dispatch, id, currentUser } = this.props
    dispatch(uploadImage({
      id,
      subject: 'project',
      path: `user/${currentUser.id}/projects`
    }))
  }

  removeImage = () => {
    let { id, dispatch } = this.props
    dispatch(removeImage('project', id))
  }

  save = () => {
    let { dispatch, id, project, projectEdit } = this.props

    if (id) {
      dispatch(updateProject(id, projectEdit))
      dispatch(navigate(`/project/${project.id}/${project.slug}`))
    }
  }

  render () {
    let { project, projectEdit, pending, imagePending } = this.props
    let { title, intention, details, location, media } = projectEdit
    let image = find(media, m => m.type === 'image')
    let video = find(media, m => m.type === 'video')

    return <div id='project-editor'>
      <p className='intro'>
        <button className='btn-primary right' onClick={this.save} disabled={pending}>
          {project.published_at ? 'Update' : 'Save Draft'}
        </button>
        Everything amazing in the world begins with a story of what might be. Tell a story about what you want to create, and how it could become real. It doesn't have to be perfect; you can always return to edit it later.
      </p>

      <section>
        <Counter value={title} max={60}/>
        <label>Project title</label>
        <input type='text' className='form-control' value={title}
          placeholder='What is your project called?' maxLength='60'
          onChange={this.update('title')}/>
      </section>

      <section>
        <Counter value={intention} max={200}/>
        <label>Your intention for this project</label>
        <input type='text' className='form-control' value={intention}
          placeholder='What do you want this project to accomplish?' maxLength='200'
          onChange={this.update('intention')}/>
      </section>

      <section>
        <label>Project details</label>
        <textarea className='form-control details' value={details}
          placeholder='Provide more detail about the project, and why it is important to you.'
          onChange={this.update('details')}></textarea>
        <div className='help'>
          <a href='/help/markdown' target='_blank'>Markdown</a> is supported.
        </div>
      </section>

      <section>
        <label>Photo or video</label>
        <p className='help'>
          A picture is worth a thousand words, and a video can help you communicate the impact of your project even more effectively.
        </p>
        <input type='text' value={video ? video.url : ''}
          onChange={this.updateVideo}
          className='form-control video'
          placeholder='Add a link to YouTube or Vimeo'/>
        <span> or </span>
        <ImageAttachmentButton pending={imagePending} image={image}
          add={this.attachImage} remove={this.removeImage}/>
      </section>

      <section>
        <Counter value={location} max={60}/>
        <label>Project location (optional)</label>
        <input type='text' className='form-control' value={location}
          placeholder='Where is this project located?' maxLength='60'
          onChange={this.update('location')}/>
      </section>

      <div className='right'>
        <button className='btn-primary' onClick={this.save} disabled={pending}>
          {project.published_at ? 'Update' : 'Save Draft'}
        </button>
      </div>
    </div>
  }
}

const Counter = ({value, max}) => {
  let len = value ? (value.length ? value.length : value) : 0
  return <div className='counter'>{len}/{max}</div>
}
