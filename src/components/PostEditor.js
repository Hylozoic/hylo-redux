/*

N.B.: in the database, Post has columns called "name" and "description".
Below, we use "title" and "details" instead for CSS and user-facing text,
because they make more sense.

*/

import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import cx from 'classnames'
import autoproxy from 'autoproxy'
import {
  debounce, difference, compact, filter, find, get, includes, isEmpty, some,
  startsWith, keys, uniq
} from 'lodash'
import { map } from 'lodash/fp'
import CommunityTagInput from './CommunityTagInput'
import Dropdown from './Dropdown'
import EventPostEditor from './EventPostEditor'
import ProjectPostEditor from './ProjectPostEditor'
import RichTextEditor from './RichTextEditor'
import { NonLinkAvatar } from './Avatar'
import AutosizingTextarea from './AutosizingTextarea'
import Icon, { IconGoogleDrive } from './Icon'
import LinkPreview from './LinkPreview'
import Tooltip from './Tooltip'
import { connect } from 'react-redux'
import {
  createPost, cancelPostEdit, fetchLinkPreview, removeImage, removeDoc,
  updatePost, updatePostEditor
} from '../actions/posts'
import { uploadImage } from '../actions/uploadImage'
import { uploadDoc } from '../actions/uploadDoc'
import { attachmentParams } from '../util/shims'
import { findUrls } from '../util/linkify'
import { isKey, onEnter } from '../util/textInput'
import { responseMissingTagDescriptions } from '../util/api'
import {
  showModal, CREATE_POST, FETCH_LINK_PREVIEW, UPDATE_POST, UPLOAD_IMAGE
} from '../actions'
import { updateCommunityChecklist } from '../actions/communities'
import { ADDED_POST, EDITED_POST, trackEvent } from '../util/analytics'
import { getCommunity, getCurrentCommunity } from '../models/community'
const { array, bool, func, object, string } = React.PropTypes

export const newPostId = 'new-post'

@autoproxy(connect((state, { community, post, project, type, tag }) => {
  const id = post ? post.id
    : type === 'project' ? 'new-project'
    : type === 'event' ? 'new-event' : newPostId

  // this object tracks the edits that are currently being made
  const postEdit = state.postEdits[id] || {}
  const { editingTagDescriptions, creatingTagAndDescription, pending } = state
  const postCommunities = map(id => getCommunity(id, state), postEdit.community_ids)
  const currentCommunity = getCurrentCommunity(state)

  return {
    id,
    postEdit,
    mentionOptions: state.typeaheadMatches.post,
    saving: pending[CREATE_POST] || pending[UPDATE_POST],
    imagePending: pending[UPLOAD_IMAGE],
    linkPreviewPending: pending[FETCH_LINK_PREVIEW],
    currentCommunitySlug: get(currentCommunity, 'slug'),
    editingTagDescriptions,
    creatingTagAndDescription,
    postCommunities,
    defaultTags: get(currentCommunity, 'defaultTags')
  }
}, null, null, {withRef: true}))
export class PostEditor extends React.Component {
  static propTypes = {
    dispatch: func,
    mentionOptions: array,
    post: object,
    id: string.isRequired,
    postEdit: object,
    community: object,
    saving: bool,
    onCancel: func,
    imagePending: bool,
    type: string,
    tag: string,
    currentCommunitySlug: string,
    editingTagDescriptions: bool,
    creatingTagAndDescription: bool,
    postCommunities: array,
    defaultTags: array
  }

  static contextTypes = {
    currentUser: object
  }

  constructor (props) {
    super(props)
    this.state = {name: this.props.postEdit.name}
  }

  componentDidMount () {
    // initialize the communities list when opening the editor in a community
    const { community, postEdit: { communities, id }, tag } = this.props
    if (community && isEmpty(communities)) this.addCommunity(community)
    if (tag) {
      this.updateStore({tag})
    } else if (!id) {
      this.updateStore({tag: 'request'})
    }
    this.refs.title.focus()
  }

  updateStore = (data) => {
    let { id, dispatch } = this.props
    dispatch(updatePostEditor(data, id))
  }

  _self () {
    return this.getWrappedInstance ? this.getWrappedInstance() : this
  }

  cancel () {
    let { dispatch, id, onCancel } = this._self().props
    dispatch(cancelPostEdit(id))
    if (typeof onCancel === 'function') onCancel()
  }

  set = key => event => this.updateStore({[key]: event.target.value})

  setDelayed = debounce((key, value) => this.updateStore({[key]: value}), 50)

  addCommunity = ({ id }) => {
    const { community_ids } = this.props.postEdit
    this.updateStore({community_ids: (community_ids || []).concat(id)})
  }

  removeCommunity = ({ id }) => {
    const { community_ids } = this.props.postEdit
    this.updateStore({community_ids: filter(community_ids, cid => cid !== id)})
  }

  validate () {
    let { postEdit } = this.props
    const { title, subeditor } = this.refs

    if (!postEdit.name) {
      window.alert('The title of a post cannot be blank.')
      title.focus()
      return Promise.resolve(false)
    }

    if (isEmpty(postEdit.community_ids)) {
      window.alert('Please pick at least one community.')
      return Promise.resolve(false)
    }

    if (subeditor) {
      const subvalidate = subeditor.validate || subeditor.getWrappedInstance().validate
      return Promise.resolve(subvalidate())
    }

    return Promise.resolve(true)
  }

  saveIfValid () {
    const self = this._self()

    // this forces a final blur event on TinyMCE
    const { tagSelector, title } = self.refs
    tagSelector ? tagSelector.focus() : title.focus()

    self.validate().then(valid => {
      if (!valid) return
      // we use setTimeout here to avoid a race condition. the description field
      // (tinymce) doesn't fire its change event until it loses focus, and
      // there's an additional delay due to the use of setDelayed.
      //
      // so if we click Save immediately after typing in the description
      // field, we have to wait for events from the description field to be
      // handled, otherwise the last edit will be lost.
      setTimeout(() => self.save(), 200)
    })
  }

  saveWithTagDescriptions = tagDescriptions => {
    this.updateStore({tagDescriptions})
    this.saveIfValid()
  }

  updatePostTagAndDescription = tagDescriptions => {
    let tag = keys(tagDescriptions)[0]
    this.updateStore({tag, tagDescriptions})
  }

  save () {
    const { dispatch, post, postEdit, id, postCommunities, community } = this.props
    const params = {
      type: this.editorType(),
      ...postEdit,
      ...attachmentParams(post && post.media, postEdit.media)
    }

    dispatch((post ? updatePost : createPost)(id, params))
    .then(action => {
      if (responseMissingTagDescriptions(action)) {
        return dispatch(showModal('tag-editor', {
          creating: false,
          saveParent: this.saveWithTagDescriptions
        }))
      }
      trackEvent(post ? EDITED_POST : ADDED_POST, {
        tag: postEdit.tag,
        community: {name: get(postCommunities[0], 'name')}
      })
      dispatch(updateCommunityChecklist(community.slug))
      this.cancel()
    })
  }

  // this method allows you to type as much as you want into the title field, by
  // automatically truncating it to a specified length and prepending the
  // removed portion to the details field.
  updateTitle (event) {
    const { value } = event.target
    this.setState({name: value})
    if (!this.delayedUpdate) {
      this.delayedUpdate = debounce(this.updateStore, 300)
    }
    this.delayedUpdate({name: value})
  }

  goToDetails = () => {
    this.setState({showDetails: true})
    this.refs.details.focus()
  }

  tabToDetails = event => {
    if (isKey(event, 'TAB') && !event.shiftKey) {
      event.preventDefault()
      this.goToDetails()
    }
  }

  handleAddTag = tag => {
    if (this.editorType()) return
    tag = tag.replace(/^#/, '')
    if (includes(this.props.defaultTags, tag)) {
      this.updateStore({tag})
    }
  }

  editorType () {
    const type = this.props.postEdit.type || this.props.type
    return includes(['event', 'project'], type) ? type : null
  }

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  updateDescription (value) {
    this.setDelayed('description', value)
    const { dispatch, postEdit: { description, linkPreview } } = this.props
    if (linkPreview) return

    const currentUrls = findUrls(value)
    if (isEmpty(currentUrls)) return

    const newUrls = difference(currentUrls, findUrls(description))
    if (isEmpty(newUrls)) return

    const poll = (url, delay) =>
      dispatch(fetchLinkPreview(url))
      .then(({ payload }) => {
        if (delay > 4) return // give up

        if (!payload.id) {
          setTimeout(() => poll(url, delay * 2), delay * 1000)
        } else if (payload.title) {
          this.updateStore({linkPreview: payload})
        }
      })

    poll(newUrls[0], 0.5)
  }

  render () {
    const {
      post, postEdit, dispatch, imagePending, saving, id, defaultTags
    } = this.props
    const { currentUser } = this.context
    const { description, community_ids, tag, linkPreview } = postEdit
    const selectableTags = uniq(compact([this.props.tag, tag].concat(defaultTags)))
    const { name, showDetails } = this.state
    const editorType = this.editorType()
    const shouldSelectTag = !includes(['event', 'project'], editorType)
    const selectTag = tag => this.updateStore({tag})
    const createTag = () => dispatch(showModal('tag-editor', {
      useCreatedTag: this.updatePostTagAndDescription,
      creating: true
    }))
    const Subeditor = editorType === 'event' ? EventPostEditor
      : editorType === 'project' ? ProjectPostEditor : null
    const removeLinkPreview = () => this.updateStore({linkPreview: null})

    return <div className='post-editor clearfix'>
      <PostEditorHeader person={currentUser}/>

      <div className='title-wrapper'>
        <AutosizingTextarea type='text' ref='title' className='title'
          value={name}
          maxLength={120}
          placeholder={placeholderText(this.editorType())}
          onKeyDown={onEnter(this.goToDetails)}
          onChange={event => this.updateTitle(event)}/>
      </div>

      {shouldSelectTag && <Dropdown className='hashtag-selector' keyControlled
        onChange={this.goToDetails}
        toggleChildren={<button ref='tagSelector' id='tag-selector' onKeyDown={this.tabToDetails}>
          #{tag || 'all-topics'}&nbsp;
          <span className='caret'></span>
        </button>}>
        {selectableTags.map(t => <li key={t}>
          <a onClick={() => selectTag(t)}>#{t}</a>
        </li>)}
        <li><a onClick={() => selectTag(null)}>#all-topics</a></li>
        <li className='create'><a onClick={() => createTag()}>Create New Topic</a></li>
      </Dropdown>}
      {id && <Tooltip id='selector'
        index={1}
        arrow='left'
        position='bottom'
        parentId='tag-selector'
        title='Action Topics'>
        <p>Use this pull-down menu to select from one of Hylo’s three Action Topics: Offer (something you’d like to share), Request (something you’re looking for), Intention (something you’d like to create), or create a new Topic.</p>
        <p>Action Topics help you make good things happen in your community.</p>
      </Tooltip>}

      <RichTextEditor className={cx('details', {empty: !description && !showDetails})}
        ref='details'
        name={post ? `post${id}` : id}
        content={description}
        onChange={ev => this.updateDescription(ev.target.value)}
        onAddTag={this.handleAddTag}
        onBlur={() => this.setState({showDetails: false})}/>
      {!description && !showDetails &&
        <div className='details-placeholder' onClick={this.goToDetails}>
          More details
        </div>}

      {linkPreview && <LinkPreview {...{linkPreview}} onClose={removeLinkPreview}/>}

      {Subeditor && <Subeditor ref='subeditor'
        {...{post, postEdit, update: this.updateStore}}/>}

      <div className='communities'>
        <span>in&nbsp;</span>
        <CommunitySelector ids={community_ids}
          onSelect={this.addCommunity}
          onRemove={this.removeCommunity}/>
      </div>

      <div className='buttons'>

        <VisibilityDropdown
          isPublic={postEdit.public || false}
          setPublic={isPublic => this.updateStore({public: isPublic})}/>

        <AttachmentsDropdown id={this.props.id}
          media={postEdit.media}
          path={`user/${currentUser.id}/seeds`}
          imagePending={imagePending}/>

        <div className='right'>
          <a className='cancel' onClick={() => this.cancel()}>
            <Icon name='Fail'/>
          </a>
        </div>

        <button className='save right' ref='save' onClick={() => this.saveIfValid()}
          disabled={saving}>
          {post ? 'Save Changes' : 'Post'}
        </button>

      </div>
    </div>
  }
}

const VisibilityDropdown = ({ isPublic, setPublic }, { dispatch }) => {
  const toggle = isPublic
    ? <button><Icon name='World'/>Public <span className='caret'/></button>
    : <button><Icon name='Users'/>Only Communities <span className='caret'/></button>

  const communityOption = <li key='community'><a onClick={() => setPublic(false)}><div>
    <span className='option-title'> <Icon name='Users'/>Only Communities</span>
    <span className='description'>Allow communities and people who are tagged to see this post.</span>
  </div></a></li>

  const publicOption = <li key='public'><a onClick={() => setPublic(true)}><div>
    <span className='option-title'><Icon name='World'/>Public</span>
    <span className='description'>Allow anyone on the internet to see this post.</span>
  </div></a></li>

  const options = isPublic
    ? [publicOption, communityOption]
    : [communityOption, publicOption]

  return <Dropdown toggleChildren={toggle} className='visibility'>
    {options}
  </Dropdown>
}

const AttachmentsDropdown = (props, { dispatch }) => {
  const { id, imagePending, media, path } = props
  const image = find(media, m => m.type === 'image')
  const docs = filter(media, m => m.type === 'gdoc')
  const length = (image ? 1 : 0) + docs.length

  const attachDoc = () => dispatch(uploadDoc(id))
  const attachImage = () => {
    dispatch(uploadImage({
      id, path, subject: 'post',
      convert: {width: 800, format: 'jpg', fit: 'max', rotate: 'exif'}
    }))
  }

  return <Dropdown className='attachments' toggleChildren={
    <span>
      <button>+</button>
      {imagePending
        ? ' Uploading...'
        : length > 0 && ` (${length})`}
    </span>
  }>
    <li>
      <a onClick={attachImage}>
        <span>
          <Icon name='Cloud-Upload' />
          {image ? 'Change' : 'Upload'} Image
        </span>
        <div className='description'>
          Upload an image from your computer, a URL or social media.
        </div>
      </a>
    </li>
    <li>
      <a onClick={attachDoc}>
        <span>
          <IconGoogleDrive />Google Drive
        </span>
        <div className='description'>
          Attach documents, images or videos from Google Drive.
        </div>
        </a>
    </li>
    {(image || some(docs)) && <li role='separator' className='divider'></li>}
    {image && <li className='image'>
      <a className='remove' onClick={() => dispatch(removeImage('post', id))}>
        &times;
      </a>
      <img src={image.url}/>
    </li>}
    {image && some(docs) && <li role='separator' className='divider'></li>}
    {docs.map(doc => <li key={doc.url} className='doc'>
      <a target='_blank' href={doc.url}>
        <img src={doc.thumbnail_url}/>
        {doc.name}
      </a>
      <a className='remove' onClick={() => dispatch(removeDoc(doc, id))}>&times;</a>
    </li>)}
  </Dropdown>
}
AttachmentsDropdown.propTypes = {id: string, imagePending: bool, media: array, path: string}
AttachmentsDropdown.contextTypes = {dispatch: func}

class CommunitySelector extends React.Component {
  constructor (props) {
    super(props)
    this.state = {term: ''}
  }

  static propTypes = {
    ids: array,
    onSelect: func.isRequired,
    onRemove: func.isRequired
  }

  static contextTypes = {
    currentUser: object.isRequired
  }

  render () {
    const { term } = this.state
    const { ids, onSelect, onRemove } = this.props
    const { currentUser: { memberships } } = this.context

    const match = c =>
      startsWith(c.name.toLowerCase(), term.toLowerCase()) &&
      !includes(ids, c.id)

    const choices = term
      ? filter(memberships.map(m => m.community), match)
      : []

    return <CommunityTagInput ids={ids}
      handleInput={term => this.setState({term})}
      choices={choices}
      onSelect={onSelect}
      onRemove={onRemove}/>
  }
}

const PostEditorHeader = ({ person }) =>
  <div className='header'>
    <NonLinkAvatar person={person}/>
    <div>
      <span className='name'>{person.name}</span>
    </div>
  </div>

export default class PostEditorWrapper extends React.Component {
  static propTypes = {
    post: object,
    community: object,
    type: string,
    expanded: bool,
    tag: string,
    onCancel: func
  }

  static contextTypes = {
    currentUser: object
  }

  constructor (props) {
    super(props)
    this.state = {expanded: props.expanded}
  }

  toggle = () => {
    this.setState({expanded: !this.state.expanded})
  }

  render () {
    let { type, post, community, tag, onCancel } = this.props

    // if PostEditorWrapper is being initialized with expanded=true, we don't
    // want to set up onCancel, because the entire component will probably be
    // unmounted when canceling takes place
    onCancel = onCancel ||
      (this.props.expanded ? () => {} : this.toggle)

    if (!this.state.expanded) {
      const { currentUser } = this.context
      if (!currentUser) return null

      return <div className='post-editor post-editor-wrapper' onClick={this.toggle}>
        <PostEditorHeader person={currentUser}/>
        <div className='prompt'>
          {placeholderText(type)}
        </div>
      </div>
    }

    return <PostEditor {...{post, community, type, onCancel, tag}}/>
  }
}

const placeholderText = type =>
  type === 'event' ? 'Create an event'
    : type === 'project' ? 'Start a project'
    : 'Start a conversation'
