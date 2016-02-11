/*

N.B.: in the database, Post has columns called "name" and "description".
Below, we use "title" and "details" instead for CSS and user-facing text,
because they make more sense.

*/

import React from 'react'
import { filter, find, get, includes, isEmpty, omit, startsWith } from 'lodash'
import cx from 'classnames'
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

  // FIXME: this one attribute in postEdit isn't actually a post attribute
  let { expanded } = postEdit

  if (!project && post) project = get(post, 'projects.0')

  return {
    id,
    postEdit,
    project,
    expanded,
    mentionChoices: state.typeaheadMatches.post,
    currentUser: state.people.current,
    saving: state.pending[CREATE_POST] || state.pending[UPDATE_POST]
  }
})
export default class PostEditor extends React.Component {
  static propTypes = {
    expanded: bool,
    dispatch: func,
    mentionChoices: array,
    currentUser: object,
    post: object,
    id: string.isRequired,
    postEdit: object,
    community: object,
    saving: bool,
    project: object
  }

  constructor (props) {
    super(props)
    this.state = {communityChoiceTerm: ''}
  }

  updateStore (data) {
    let { id, dispatch } = this.props
    dispatch(updatePostEditor(data, id))
  }

  selectType = (type, event) =>
    this.updateStore({type: type})

  expand = () => {
    if (this.props.expanded) return
    this.updateStore({expanded: true})

    // initialize the communities list when opening the editor in a community
    let { community, postEdit: { communities } } = this.props
    if (community && isEmpty(communities)) this.addCommunity(community)
  }

  cancel = () => {
    let { dispatch, id } = this.props
    dispatch(cancelPostEdit(id))
  }

  setName = event =>
    this.updateStore({name: event.target.value})

  setDescription = event => this.updateStore({description: event.target.value})

  addCommunity = community => {
    let { communities } = this.props.postEdit
    this.updateStore({communities: (communities || []).concat(community.id)})
  }

  setLocation = event => this.updateStore({location: event.target.value})

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

    // we use setTimeout here to avoid a race condition. the description field (tinymce)
    // may not fire its change event until it loses focus, so if we click Post
    // immediately after typing in the description field, we have to wait for props
    // to update from the store
    setTimeout(() => {
      let { dispatch, post, postEdit, project, id } = this.props

      postEdit = {
        ...omit(postEdit, 'expanded'),
        type: postEdit.type || 'chat'
      }

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

  render () {
    let { expanded, post, postEdit, dispatch, project } = this.props
    let { name, description, communities, type, location } = postEdit
    let { communityChoiceTerm } = this.state
    let communityChoices = this.getCommunityChoices(communityChoiceTerm)

    if (!type) type = 'chat'

    return <div className={cx('post-editor', 'clearfix', {expanded})}>
      {post && <h3>Editing Post</h3>}
      <ul className='left post-types'>
        {postTypes.map(t => <li key={t}
          className={cx('post-type', t, {selected: t === type})}
          onClick={() => this.selectType(t)}>
          {t}
        </li>)}
      </ul>

      <input type='text' ref='name' className='title form-control'
        placeholder={postTypeData[type].placeholder}
        onFocus={this.expand} value={name} onChange={this.setName}/>

      {expanded && <div>
        <h3>Details</h3>
        <RichTextEditor className='details'
          content={description}
          onChange={this.setDescription}
          mentionTemplate={personTemplate}
          mentionTypeahead={text => dispatch(typeahead(text, 'post'))}
          mentionChoices={this.props.mentionChoices}
          mentionSelector='[data-user-id]'/>

        {type === 'event' && <div className='input-row'>
          <label>
            <p>Location (Optional)</p>
            <input type='text' ref='location' className='location form-control'
              value={location}
              onChange={this.setLocation}/>
          </label>
        </div>}

        {!project && <div>
          <h3 className='communities-header'>Communities</h3>
          <CommunityTagInput ids={communities}
            handleInput={this.updateCommunityChoiceTerm}
            choices={communityChoices}
            onSelect={this.addCommunity}
            onRemove={this.removeCommunity}/>
        </div>}

        <label className='visibility'>
          <input type='checkbox' value={postEdit.public} onChange={this.togglePublic}/>
          &nbsp;
          Make this post publicly visible
        </label>

        <div className='buttons'>
          <div className='right'>
            <button onClick={this.cancel}>Cancel</button>
            <button className='btn-primary' onClick={this.save} disabled={this.props.saving}>
              {post ? 'Save Changes' : 'Post'}
            </button>
          </div>

          <AttachmentButtons id={this.props.id} media={postEdit.media}
            path={`user/${this.props.currentUser.id}/seeds`}/>
        </div>
      </div>}
    </div>
  }
}

@connect(state => ({imagePending: state.pending[UPLOAD_IMAGE]}))
class AttachmentButtons extends React.Component {
  static propTypes = {
    imagePending: bool,
    dispatch: func,
    id: string,
    media: array,
    path: string
  }

  attachImage = () => {
    let { id, dispatch, path } = this.props

    dispatch(uploadImage({
      subject: 'post',
      id,
      path,
      convert: {width: 800, format: 'jpg', fit: 'max', rotate: 'exif'}
    }))
  }

  removeImage = () => {
    let { id, dispatch } = this.props
    dispatch(removeImage('post', id))
  }

  attachDoc = () => {
    let { id, dispatch } = this.props
    dispatch(uploadDoc(id))
  }

  removeDoc = doc => {
    let { id, dispatch } = this.props
    dispatch(removeDoc(doc, id))
  }

  render () {
    let { imagePending, media } = this.props
    let image = find(media, m => m.type === 'image')
    let docs = filter(media, m => m.type === 'gdoc')

    return <div>
      <ImageAttachmentButton pending={imagePending} image={image}
        add={this.attachImage} remove={this.removeImage}/>

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
              <a className='remove' onClick={() => this.removeDoc(doc)}>&times;</a>
            </li>)}
            <li role='separator' className='divider'></li>
            <li><a onClick={this.attachDoc}>Attach Another</a></li>
          </Dropdown>
        : <button onClick={this.attachDoc}>
            Attach File with Google Drive
          </button>}
    </div>
  }
}
