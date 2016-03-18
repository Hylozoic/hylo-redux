import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { UPDATE_PROJECT, UPLOAD_IMAGE, navigate, removeImage } from '../../actions'
import { createProject, fetchProject, updateProject, updateProjectEditor } from '../../actions/project'
import { uploadImage } from '../../actions/uploadImage'
import ImageAttachmentButton from '../../components/ImageAttachmentButton'
import Select from '../../components/Select'
import { find, isEmpty } from 'lodash'
import cx from 'classnames'
import { ADDED_PROJECT, EDITED_PROJECT, trackEvent } from '../../util/analytics'
const { bool, func, object, string } = React.PropTypes

const visibilityOptions = [
  {id: 0, name: 'Only the community'},
  {id: 1, name: 'Anyone'}
]

@prefetch(({ dispatch, params: { id } }) => id && dispatch(fetchProject(id)))
@connect(({ projects, projectEdits, pending, people }, { params: { id } }) => {
  if (!id) id = 'new'
  let project = projects[id]
  let currentUser = people.current

  // copy the project when the edit starts -- don't need to save it
  // elsewhere in the store until something is actually changed
  let projectEdit = {...project, ...projectEdits[id]}
  if (!projectEdit.community) {
    projectEdit.community = currentUser.memberships[0].community
  }

  return {
    id,
    project,
    projectEdit,
    pending: pending[UPDATE_PROJECT],
    imagePending: pending[UPLOAD_IMAGE],
    currentUser
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

  update = (field, value) => {
    let { dispatch, id } = this.props
    dispatch(updateProjectEditor(id, {[field]: value}))
  }

  updateFromEvent = field => event => this.update(field, event.target.value)

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

    return dispatch((project ? updateProject : createProject)(id, projectEdit))
    .then(action => {
      trackEvent(project ? EDITED_PROJECT : ADDED_PROJECT, {project: projectEdit})
      let { id, slug } = action.payload
      dispatch(navigate(`/project/${id}/${slug}`))
    })
  }

  unpublish = () => {
    let { dispatch, project } = this.props
    dispatch(updateProject(project.id, {unpublish: true}))
    .then(() => dispatch(navigate(`/project/${project.id}/${project.slug}`)))
  }

  render () {
    let { project, projectEdit, pending, imagePending, currentUser } = this.props
    let { title, intention, details, location, media, community, visibility } = projectEdit
    let image = find(media, m => m.type === 'image')
    let video = find(media, m => m.type === 'video')
    let communities = currentUser.memberships.map(m => m.community)
    let selectedVisibility = visibilityOptions.find(o => o.id === visibility) || visibilityOptions[0]
    let isPublished = !!(project && project.published_at)

    return <div id='project-editor' className='simple-page'>
      <p className='intro'>
        <SaveButton onClick={this.save} {...{isPublished, pending}} className='right'/>
        Everything amazing in the world begins with a story of what might be. Tell a story about what you want to create, and how it could become real. It doesn't have to be perfect; you can always return to edit it later.
      </p>

      <section>
        <Counter value={title} max={60}/>
        <label>Project title</label>
        <input type='text' className='form-control' value={title}
          placeholder='What is your project called?' maxLength='60'
          onChange={this.updateFromEvent('title')}/>
      </section>

      <section>
        <Counter value={intention} max={200}/>
        <label>Your intention for this project</label>
        <input type='text' className='form-control' value={intention}
          placeholder='What do you want this project to accomplish?' maxLength='200'
          onChange={this.updateFromEvent('intention')}/>
      </section>

      <section>
        <label>Photo or video</label>
        <p className='help'>
          A picture is worth a thousand words, and a video can help you communicate the impact of your project even more effectively.
        </p>
        <input type='text' value={video ? video.url : ''}
          onChange={this.updateFromEvent('video')}
          className='form-control video'
          placeholder='Add a link to YouTube or Vimeo'/>
        <span> or </span>
        <ImageAttachmentButton pending={imagePending} image={image}
          add={this.attachImage} remove={this.removeImage}/>
      </section>

      <section>
        <label>Project details</label>
        <textarea className='form-control details' value={details}
          placeholder='Provide more detail about the project, and why it is important to you.'
          onChange={this.updateFromEvent('details')}></textarea>
        <div className='help'>
          <a href='/help/markdown' target='_blank'>Markdown</a> is supported.
        </div>
      </section>

      <div className='row'>
        <section className='col-sm-6'>
          <label>Community</label>
          <p className='help'>Which community will support this project the most?</p>
          <Select choices={communities} selected={community}
            onChange={c => this.update('community', c)}/>
        </section>
        <section className='col-sm-6'>
          <Counter value={location} max={60}/>
          <label>Project location (optional)</label>
          <input type='text' className='form-control' value={location}
            placeholder='Where is this project located?' maxLength='60'
            onChange={this.updateFromEvent('location')}/>
        </section>
      </div>

      <div className='row'>
        <section className='col-sm-6'>
          <label>Visibility</label>
          <p className='help'>Control who can see and contribute to this project.</p>
          <Select choices={visibilityOptions} selected={selectedVisibility}
            onChange={opt => this.update('visibility', opt.id)}/>
        </section>
      </div>

      <div className='buttons right'>
        {isPublished && <button onClick={this.unpublish}>Unpublish</button>}
        <SaveButton onClick={this.save} {...{isPublished, pending}}/>
      </div>
    </div>
  }
}

const SaveButton = ({ onClick, isPublished, className, pending }) => {
  return <button className={cx('btn-primary', className)} {...{onClick}} disabled={pending}>
    {isPublished ? 'Update' : 'Save Draft'}
  </button>
}

const Counter = ({value, max}) => {
  let len = value ? (value.length ? value.length : value) : 0
  return <div className='counter'>{len}/{max}</div>
}
