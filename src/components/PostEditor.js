/*

N.B.: in the database, Post has columns called "name" and "description".
Below, we use "title" and "details" instead for CSS and user-facing text,
because they make more sense.

*/

import React from 'react'
import { filter, find, get, includes, isEmpty, startsWith } from 'lodash'
import CommunityTagInput from './CommunityTagInput'
import Dropdown from './Dropdown'
import ImageAttachmentButton from './ImageAttachmentButton'
import RichTextEditor from './RichTextEditor'
import { connect } from 'react-redux'
import {
  typeahead, updatePostEditor, createPost, updatePost, cancelPostEdit,
  removeImage, removeDoc
} from '../actions'
import { uploadImage } from '../actions/uploadImage'
import { uploadDoc } from '../actions/uploadDoc'
import { attachmentParams } from '../util/shims'
import truncate from 'html-truncate'
import { CREATE_POST, UPDATE_POST, UPLOAD_IMAGE } from '../actions'
import { personTemplate } from '../util/mentions'
import { ADDED_POST, EDITED_POST, trackEvent } from '../util/analytics'
const { array, bool, func, object, string } = React.PropTypes

const postTypes = ['chat', 'request', 'offer', 'intention', 'event']

const postTypeData = {
  intention: {
    placeholder: 'What would you like to create?'
  },
  offer: {
    placeholder: 'What would you like to share?'
  },
  request: {
    placeholder: 'What are you looking for?'
  },
  chat: {
    placeholder: 'What do you want to say?'
  },
  event: {
    placeholder: "What is your event's name?"
  }
}

@connect((state, { community, post, project }) => {
  let id = post
    ? post.id
    : project
      ? `project-${project.id}-new`
      : 'new'

  // this object tracks the edits that are currently being made
  let postEdit = state.postEdits[id] || {}

  if (!project && post) project = get(post, 'projects.0')

  return {
    id,
    postEdit,
    project,
    mentionChoices: state.typeaheadMatches.post,
    currentUser: state.people.current,
    saving: state.pending[CREATE_POST] || state.pending[UPDATE_POST]
  }
}, null, null, {withRef: true})
export class PostEditor extends React.Component {
  static propTypes = {
    dispatch: func,
    mentionChoices: array,
    currentUser: object,
    post: object,
    id: string.isRequired,
    postEdit: object,
    community: object,
    saving: bool,
    project: object,
    onCancel: func
  }

  constructor (props) {
    super(props)
    this.state = {communityChoiceTerm: ''}
  }

  componentDidMount () {
    // initialize the communities list when opening the editor in a community
    let { community, postEdit: { communities } } = this.props
    if (community && isEmpty(communities)) this.addCommunity(community)
  }

  updateStore (data) {
    let { id, dispatch } = this.props
    dispatch(updatePostEditor(data, id))
  }

  selectType = (type) => this.updateStore({type: type})

  cancel = () => {
    let { dispatch, id, onCancel } = this.props
    dispatch(cancelPostEdit(id))
    if (typeof onCancel === 'function') onCancel()
  }

  set = key => event => this.updateStore({[key]: event.target.value})

  addCommunity = community => {
    let { communities } = this.props.postEdit
    this.updateStore({communities: (communities || []).concat(community.id)})
  }

  removeCommunity = community => {
    let { communities } = this.props.postEdit
    this.updateStore({communities: filter(communities, cid => cid !== community.id)})
  }

  togglePublic = () =>
    this.updateStore({public: !this.props.postEdit.public})

  validate () {
    let { postEdit, project } = this.props

    if (!postEdit.name) {
      window.alert('The title of a post cannot be blank.')
      this.refs.name.focus()
      return
    }

    if (!project && isEmpty(postEdit.communities)) {
      window.alert('Please pick at least one community.')
      return
    }

    return true
  }

  save = () => {
    if (!this.validate()) return

    // we use setTimeout here to avoid a race condition. the description field
    // (tinymce) doesn't fire its change event until it loses focus, so if we
    // click Save immediately after typing in the description field, we have to
    // wait for events from the description field to be handled so that the
    // store is up to date
    setTimeout(() => this.reallySave())
  }

  reallySave () {
    let { dispatch, post, postEdit, project, id } = this.props

    if (!postEdit.type) postEdit.type = 'chat'

    let params = {
      ...postEdit,
      ...attachmentParams(post && post.media, postEdit.media),
      projectId: project ? project.id : null
    }

    dispatch((post ? updatePost : createPost)(id, params))
    .then(({ error }) => {
      if (error) return
      // FIXME ideally we would pass name and slug along as well, to make
      // events more human-readable, but we're only passing around community
      // ids in this component
      let community = {id: get(postEdit, 'communities.0')}
      trackEvent(post ? EDITED_POST : ADDED_POST, {
        post: {
          id: get(post, 'id'),
          type: postEdit.type
        },
        community,
        project
      })
    })
  }

  updateCommunityChoiceTerm = term => {
    this.setState({communityChoiceTerm: term})
  }

  getCommunityChoices = term => {
    if (!term) {
      return []
    }

    let { currentUser, postEdit: { communities } } = this.props
    var match = c =>
      startsWith(c.name.toLowerCase(), term.toLowerCase()) &&
      !includes(communities, c.id)

    return filter(currentUser.memberships.map(m => m.community), match)
  }

  goToDetails = event => {
    if (event.which === 13) this.refs.details.editor().focus()
  }

  render () {
    let { post, postEdit, dispatch, project, currentUser } = this.props
    let { name, description, communities, type, location } = postEdit
    let { communityChoiceTerm } = this.state
    let communityChoices = this.getCommunityChoices(communityChoiceTerm)

    if (!type) type = 'chat'

    return <div className='post-editor clearfix'>
      <img src={currentUser.avatar_url} className='avatar'/>
      <strong className='name'>{currentUser.name}</strong>

      <input type='text' ref='name' className='title' value={name}
        placeholder='Start a conversation'
        onFocus={this.expand}
        onChange={this.set('name')}
        onKeyUp={this.goToDetails}/>

      <RichTextEditor className='details'
        ref='details'
        content={description}
        onChange={this.set('description')}
        mentionTemplate={personTemplate}
        mentionTypeahead={text => dispatch(typeahead(text, 'post'))}
        mentionChoices={this.props.mentionChoices}
        mentionSelector='[data-user-id]'/>

      {type === 'event' && <div className='input-row'>
        <label>
          <p>Location (Optional)</p>
          <input type='text' ref='location' className='location form-control'
            value={location}
            onChange={this.set('location')}/>
        </label>
      </div>}

      {!project && <div className='communities'>
        in&nbsp;
        <CommunityTagInput ids={communities}
          handleInput={this.updateCommunityChoiceTerm}
          choices={communityChoices}
          onSelect={this.addCommunity}
          onRemove={this.removeCommunity}/>
      </div>}

      <div className='buttons'>
        <div className='right'>
          <label className='visibility'>
            <input type='checkbox' value={postEdit.public} onChange={this.togglePublic}/>
            &nbsp;
            Public
          </label>
          <button onClick={this.cancel}>Cancel</button>
          <AttachmentButtons id={this.props.id} media={postEdit.media}
            path={`user/${currentUser.id}/seeds`}/>
        </div>
        <button className='save' onClick={this.save}
          disabled={this.props.saving} ref='save'>
          {post ? 'Save Changes' : 'Post'}
        </button>
        <span className='glyphicon glyphicon-camera'></span>
      </div>
    </div>
  }
}

const AttachmentButtons = connect(state => ({
  imagePending: state.pending[UPLOAD_IMAGE]
}))(props => {
  let { id, imagePending, media, dispatch, path } = props
  let image = find(media, m => m.type === 'image')
  let docs = filter(media, m => m.type === 'gdoc')

  let attachImage = () => {
    dispatch(uploadImage({
      id, path, subject: 'post',
      convert: {width: 800, format: 'jpg', fit: 'max', rotate: 'exif'}
    }))
  }

  let removeImage = () => dispatch(removeImage('post', id))
  let attachDoc = () => dispatch(uploadDoc(id))

  return <div>
    <ImageAttachmentButton pending={imagePending} image={image}
      add={attachImage} remove={removeImage}/>

    {!isEmpty(docs)
      ? <Dropdown className='button change-docs' toggleChildren={
          <span>
            Attachments ({docs.length}) <span className='caret'></span>
          </span>
        }>
          {docs.map(doc => <li key={doc.url}>
            <a target='_blank' href={doc.url}>
              <img src={doc.thumbnail_url}/>
              {truncate(doc.name, 40)}
            </a>
            <a className='remove' onClick={() => dispatch(removeDoc(doc, id))}>&times;</a>
          </li>)}
          <li role='separator' className='divider'></li>
          <li><a onClick={attachDoc}>Attach Another</a></li>
        </Dropdown>
      : <button onClick={attachDoc}>
          Attach File with Google Drive
        </button>}
  </div>
})

AttachmentButtons.propTypes = {
  imagePending: bool,
  dispatch: func,
  id: string,
  media: array,
  path: string
}

@connect(state => ({
  currentUser: state.people.current
}), null, null, {withRef: true})
export default class PostEditorWrapper extends React.Component {
  static propTypes = {
    currentUser: object,
    post: object,
    project: object
  }

  constructor (props) {
    super(props)
    this.state = {expanded: props.expanded}
  }

  toggle = () => {
    this.setState({expanded: !this.state.expanded})
  }

  render () {
    if (!this.state.expanded) {
      const { currentUser } = this.props
      return <div className='post-editor' onClick={this.toggle}>
        <img src={currentUser.avatar_url} className='avatar'/>
        <strong className='name'>{currentUser.name}</strong>
        <div className='prompt'>Start a conversation</div>
      </div>
    }

    const { post, project, community } = this.props
    return <PostEditor {...{post, project, community}} onCancel={this.toggle}/>
  }
}
