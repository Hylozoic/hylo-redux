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
  debounce, compact, filter, find, get, includes, isEmpty, keys, map, some, startsWith
} from 'lodash'
import CommunityTagInput from './CommunityTagInput'
import Dropdown from './Dropdown'
import EventPostEditor from './EventPostEditor'
import ProjectPostEditor from './ProjectPostEditor'
import RichTextEditor from './RichTextEditor'
import { NonLinkAvatar } from './Avatar'
import Icon from './Icon'
import AutosizingTextarea from './AutosizingTextarea'
import { connect } from 'react-redux'
import {
  createPost, cancelPostEdit, cancelTagDescriptionEdit, editTagDescription,
  fetchLeftNavTags, removeImage, removeDoc, updatePost, updatePostEditor
} from '../actions'
import { uploadImage } from '../actions/uploadImage'
import { uploadDoc } from '../actions/uploadDoc'
import { attachmentParams } from '../util/shims'
import { prepend } from '../util/tinymce'
import { isKey } from '../util/textInput'
import { CREATE_POST, UPDATE_POST, UPLOAD_IMAGE } from '../actions'
import { ADDED_POST, EDITED_POST, trackEvent } from '../util/analytics'
import { getCurrentCommunity } from '../models/community'
const { array, bool, func, object, string } = React.PropTypes

const specialTags = ['request', 'offer', 'intention']

export const newPostId = 'new-post'

@autoproxy(connect((state, { community, post, project, type, tag }) => {
  const id = post ? post.id
    : type === 'project' ? 'new-project'
    : type === 'event' ? 'new-event' : newPostId

  // this object tracks the edits that are currently being made
  const postEdit = state.postEdits[id] || {}
  const { editingTagDescriptions, pending } = state

  return {
    id,
    postEdit,
    mentionOptions: state.typeaheadMatches.post,
    saving: pending[CREATE_POST] || pending[UPDATE_POST],
    imagePending: pending[UPLOAD_IMAGE],
    currentCommunitySlug: get(getCurrentCommunity(state), 'slug'),
    editingTagDescriptions
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
    editingTagDescriptions: bool
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
    const { community, postEdit: { communities }, tag } = this.props
    if (community && isEmpty(communities)) this.addCommunity(community)
    if (tag) this.updateStore({tag})
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

  addCommunity = community => {
    let { communities } = this.props.postEdit
    this.updateStore({communities: (communities || []).concat(community.id)})
  }

  removeCommunity = community => {
    let { communities } = this.props.postEdit
    this.updateStore({communities: filter(communities, cid => cid !== community.id)})
  }

  validate () {
    let { postEdit } = this.props
    const { title, subeditor } = this.refs

    if (!postEdit.name) {
      window.alert('The title of a post cannot be blank.')
      title.focus()
      return Promise.resolve(false)
    }

    if (isEmpty(postEdit.communities)) {
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

  save () {
    const { dispatch, post, postEdit, id, currentCommunitySlug } = this.props
    const tag = postEdit.tag
    const params = {
      type: this.editorType(),
      ...postEdit,
      ...attachmentParams(post && post.media, postEdit.media),
      tag
    }

    dispatch((post ? updatePost : createPost)(id, params))
    .then(({ error }) => {
      if (error) return
      // FIXME ideally we would pass name and slug along as well, to make
      // events more human-readable, but we're only passing around community
      // ids in this component
      trackEvent(post ? EDITED_POST : ADDED_POST, {
        post: {id: get(post, 'id'), tag},
        community: {id: get(postEdit, 'communities.0')}
      })
      if (currentCommunitySlug) {
        dispatch(fetchLeftNavTags(currentCommunitySlug, true))
      }
      this.cancel()
    })
  }

  saveWithTagDescriptions = tagDescriptions => {
    this.updateStore({tagDescriptions})
    this.saveIfValid()
  }

  // this method allows you to type as much as you want into the title field, by
  // automatically truncating it to a specified length and prepending the
  // removed portion to the details field.
  updateTitle (event) {
    if (this.state.pendingTitleReshuffle) return

    const maxlength = 80
    const { value } = event.target
    const { length } = value
    if (length > maxlength || value.indexOf('\n') !== -1) {
      const { title, details } = this.refs
      const editor = details.getEditor()

      let splitIndex = length > maxlength
        ? value.lastIndexOf(' ', maxlength - 1)
        : value.indexOf('\n')

      const name = value.slice(0, splitIndex + 1).replace(/\n$/, '')
      const excess = value.slice(splitIndex + 1)

      this.setState({name, showDetails: true})
      this.updateStore({name})

      const pos = title.textarea.selectionStart
      if (pos <= name.length) {
        prepend(excess, editor)

        // when the above setState call lands, the cursor ends up jumping to the
        // end of the text field. we can move it back, but not until the
        // setState call is finished, so we use setTimeout.
        //
        // this introduces a small but significant gap of time, during which, if
        // someone is typing in the middle of the title field while the title
        // gets truncated, some of the characters they type could end up at the
        // end of the field.
        //
        // we "pause" the editing of the field with `pendingTitleReshuffle` to
        // avoid this. this is not great, because if your computer is slow
        // enough and you're a fast enough typer, characters will simply
        // disappear -- but to my mind, this is marginally better than having
        // them show up in the wrong place.
        this.setState({pendingTitleReshuffle: true})
        setTimeout(() => {
          this.setState({pendingTitleReshuffle: false})
          title.setCursorLocation(pos)
        })
      } else {
        if (excess) prepend(excess, editor)
        editor.focus()
      }
      setTimeout(() => title.resize())
    } else {
      this.setState({name: value})
      if (!this.delayedUpdate) {
        this.delayedUpdate = debounce(this.updateStore, 300)
      }
      this.delayedUpdate({name: value})
    }
  }

  goToDetails = () => {
    this.setState({showDetails: true})
    this.refs.details.focus()
  }

  tabToDetails = event => {
    if (isKey(event, 'TAB')) {
      event.preventDefault()
      this.goToDetails()
    }
  }

  goBackToTitle = ({ which }) => {
    if (which === 8 || which === 46) {
      const value = this.refs.details.getContent()
      if (!value) {
        this.setState({showDetails: false})
        this.refs.title.focus()
      }
    }
  }

  handleAddTag = tag => {
    if (this.editorType()) return
    tag = tag.replace(/^#/, '')
    if (includes(specialTags, tag)) {
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

  render () {
    const {
      post, postEdit, dispatch, imagePending, saving, id,
      editingTagDescriptions
    } = this.props
    const { currentUser } = this.context
    const selectableTags = compact([this.props.tag].concat(specialTags))
    const { description, communities, tag } = postEdit
    const { name, showDetails } = this.state
    const editorType = this.editorType()
    const shouldSelectTag = !includes(['event', 'project'], editorType)
    const selectTag = tag => this.updateStore({tag})
    const Subeditor = editorType === 'event' ? EventPostEditor
      : editorType === 'project' ? ProjectPostEditor : null

    return <div className='post-editor clearfix'>
      <PostEditorHeader person={currentUser}/>

      <div className='title-wrapper'>
        <AutosizingTextarea type='text' ref='title' className='title'
          value={name}
          placeholder={placeholderText(this.editorType())}
          onKeyDown={this.tabToDetails}
          onChange={event => this.updateTitle(event)}/>
      </div>

      <RichTextEditor className={cx('details', {empty: !description && !showDetails})}
        ref='details'
        name={post ? `post${id}` : id}
        content={description}
        onChange={ev => this.setDelayed('description', ev.target.value)}
        onKeyUp={this.goBackToTitle}
        onAddTag={this.handleAddTag}
        onBlur={() => this.setState({showDetails: false})}/>
      {!description && !showDetails &&
        <div className='details-placeholder' onClick={this.goToDetails}>
          More details
        </div>}

      {shouldSelectTag && <Dropdown className='hashtag-selector' toggleChildren={
        <button ref='tagSelector'>
          #{tag || 'all-topics'}&nbsp;
          <span className='caret'></span>
        </button>
      }>
        {selectableTags.map(t => <li key={t}>
          <a onClick={() => selectTag(t)}>#{t}</a>
        </li>)}
        <li><a onClick={() => selectTag(null)}>#all-topics</a></li>
      </Dropdown>}

      {Subeditor && <Subeditor ref='subeditor'
        {...{post, postEdit, update: this.updateStore}}/>}

      <div className='communities'>
        <span>in&nbsp;</span>
        <CommunitySelector communities={communities || []}
          onSelect={this.addCommunity}
          onRemove={this.removeCommunity}/>
      </div>

      <div className='buttons'>
        <div className='right'>
          <button onClick={() => this.cancel()}>Cancel</button>
        </div>

        <button className='save' ref='save' onClick={() => this.saveIfValid()}
          disabled={saving}>
          {post ? 'Save Changes' : 'Post'}
        </button>

        <AttachmentsDropdown id={this.props.id}
          media={postEdit.media}
          path={`user/${currentUser.id}/seeds`}
          imagePending={imagePending}
          dispatch={dispatch}/>

        <label className='visibility'>
          <input type='checkbox' value={postEdit.public || false}
            onChange={() => this.updateStore({public: !postEdit.public})}/>
          &nbsp;
          Public
        </label>
      </div>

      {editingTagDescriptions && <TagDescriptionEditor
        onSave={this.saveWithTagDescriptions}/>}
    </div>
  }
}

const AttachmentsDropdown = props => {
  const { id, imagePending, media, dispatch, path } = props
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
      <span className='icon-Camera'></span>
      {imagePending
        ? ' Uploading...'
        : length > 0 && ` (${length})`}
    </span>
  }>
    <li>
      <a onClick={attachImage}>
        {image ? 'Change' : 'Attach'} Image
      </a>
    </li>
    <li><a onClick={attachDoc}>Attach File with Google Drive</a></li>
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

class CommunitySelector extends React.Component {
  constructor (props) {
    super(props)
    this.state = {term: ''}
  }

  static propTypes = {
    communities: array.isRequired,
    onSelect: func.isRequired,
    onRemove: func.isRequired
  }

  static contextTypes = {
    currentUser: object.isRequired
  }

  render () {
    const { term } = this.state
    const { communities, onSelect, onRemove } = this.props
    const { currentUser: { memberships } } = this.context

    const match = c =>
      startsWith(c.name.toLowerCase(), term.toLowerCase()) &&
      !includes(communities, c.id)

    const choices = term
      ? filter(memberships.map(m => m.community), match)
      : []

    return <CommunityTagInput ids={communities}
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
    tag: string
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
    const { type, post, community, tag } = this.props

    // if PostEditorWrapper is being initialized with expanded=true, we don't
    // want to set up onCancel, because the entire component will probably be
    // unmounted when canceling takes place
    const onCancel = this.props.expanded ? () => {} : this.toggle

    if (!this.state.expanded) {
      const { currentUser } = this.context
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

@connect((state, props) => ({
  tags: state.tagDescriptionEdits
}))
class TagDescriptionEditor extends React.Component {
  static propTypes = {
    tags: object,
    onSave: func,
    dispatch: func
  }

  render () {
    const { tags, onSave, dispatch } = this.props
    const cancel = () => dispatch(cancelTagDescriptionEdit())
    const edit = debounce((tag, value) =>
      dispatch(editTagDescription(tag, value)), 200)

    return <div id='tag-description-editor'>
      <div className='backdrop'/>
      <div className='modal'>
        <h2>
          Hey, you're creating&nbsp;
          {keys(tags).length > 1 ? 'new topics.' : 'a new topic.'}
          <a className='close' onClick={cancel}><Icon name='Fail'/></a>
        </h2>
        {map(tags, (description, tag) => <div key={tag} className='tag-group'>
          <div className='topic'>
            <label>Topic</label>
            <span>#{tag}</span>
          </div>
          <div className='description'>
            <label>Description</label>
            <input type='text' defaultValue={description}
              onChange={event => edit(tag, event.target.value)}/>
          </div>
        </div>)}
        <div className='footer'>
          <button onClick={() => onSave(tags)}>Create</button>
        </div>
      </div>
    </div>
  }
}
