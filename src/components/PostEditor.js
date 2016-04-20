/*

N.B.: in the database, Post has columns called "name" and "description".
Below, we use "title" and "details" instead for CSS and user-facing text,
because they make more sense.

*/

import React from 'react'
import cx from 'classnames'
import { debounce, filter, find, get, includes, isEmpty, some, startsWith } from 'lodash'
import CommunityTagInput from './CommunityTagInput'
import Dropdown from './Dropdown'
import Icon from './Icon'
import RichTextEditor from './RichTextEditor'
import { NonLinkAvatar } from './Avatar'
import AutosizingTextarea from './AutosizingTextarea'
import { connect } from 'react-redux'
import DatetimePicker from 'react-datetime'
import {
  updatePostEditor, createPost, updatePost, cancelPostEdit,
  removeImage, removeDoc
} from '../actions'
import { uploadImage } from '../actions/uploadImage'
import { uploadDoc } from '../actions/uploadDoc'
import { attachmentParams } from '../util/shims'
import { prepend } from '../util/tinymce'
import { prepareHashtagsForEditing } from '../util/linkify'
import { CREATE_POST, UPDATE_POST, UPLOAD_IMAGE } from '../actions'
import { ADDED_POST, EDITED_POST, trackEvent } from '../util/analytics'
const { array, bool, func, object, string } = React.PropTypes

@connect((state, { community, post, project, type }) => {
  const id = post ? post.id
    : project ? `project-${project.id}-new` : 'new'

  // this object tracks the edits that are currently being made
  let postEdit = state.postEdits[id] || {}
  if (!project && post) project = get(post, 'projects.0')
  if (type === 'event' && !postEdit.type) postEdit.type = 'event'

  return {
    id,
    postEdit,
    project,
    mentionOptions: state.typeaheadMatches.post,
    currentUser: state.people.current,
    saving: state.pending[CREATE_POST] || state.pending[UPDATE_POST],
    imagePending: state.pending[UPLOAD_IMAGE]
  }
}, null, null, {withRef: true})
export class PostEditor extends React.Component {
  static propTypes = {
    dispatch: func,
    mentionOptions: array,
    currentUser: object,
    post: object,
    id: string.isRequired,
    postEdit: object,
    community: object,
    saving: bool,
    project: object,
    onCancel: func,
    imagePending: bool,
    type: string
  }

  constructor (props) {
    super(props)
    this.state = {name: this.props.postEdit.name}
  }

  componentDidMount () {
    // initialize the communities list when opening the editor in a community
    let { community, postEdit: { communities } } = this.props
    if (community && isEmpty(communities)) this.addCommunity(community)
    this.refs.title.focus()
  }

  updateStore = (data) => {
    let { id, dispatch } = this.props
    dispatch(updatePostEditor(data, id))
  }

  cancel = () => {
    let { dispatch, id, onCancel } = this.props
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
    let { postEdit, project } = this.props

    if (!postEdit.name) {
      window.alert('The title of a post cannot be blank.')
      this.refs.title.focus()
      return
    }

    if (!project && isEmpty(postEdit.communities)) {
      window.alert('Please pick at least one community.')
      return
    }

    return true
  }

  saveIfValid = () => {
    if (!this.validate()) return

    // we use setTimeout here to avoid a race condition. the description field
    // (tinymce) doesn't fire its change event until it loses focus, so if we
    // click Save immediately after typing in the description field, we have to
    // wait for events from the description field to be handled so that the
    // store is up to date
    setTimeout(() => this.save(), 100)
  }

  save () {
    const { dispatch, post, postEdit, project, id } = this.props
    const params = {
      tag: 'chat',
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
          tag: postEdit.tag
        },
        community,
        project
      })
      this.cancel()
    })
  }

  // this method allows you to type as much as you want into the title field, by
  // automatically truncating it to a specified length and prepending the
  // removed portion to the details field.
  updateTitle (event) {
    if (this.state.pendingTitleReshuffle) return

    const maxlength = 120
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
    if (this.props.postEdit.type === 'event') return
    tag = tag.replace(/^#/, '')
    if (includes(['request', 'offer'], tag)) {
      this.updateStore({tag})
    }
  }

  render () {
    let {
      post, postEdit, dispatch, project, currentUser, imagePending, saving
    } = this.props
    let { description, communities, tag } = postEdit
    let { name, showDetails } = this.state
    const isEvent = postEdit.type === 'event'

    // FIXME this should be performed during the creation of the postEdits entry
    // in the store
    if (!this.preparedDescription) {
      const editingDescription = prepareHashtagsForEditing(description)
      if (editingDescription !== description) {
        description = editingDescription
      }
      this.preparedDescription = true
    }

    if (!tag) tag = 'chat'
    const selectTag = tag => this.updateStore({tag})

    return <div className='post-editor clearfix'>
      <PostEditorHeader person={currentUser}/>

      <div className='title-wrapper'>
        <AutosizingTextarea type='text' ref='title' className='title'
          value={name}
          placeholder={placeholderText(isEvent)}
          onFocus={this.expand}
          onChange={event => this.updateTitle(event)}/>
      </div>

      <RichTextEditor className={cx('details', {empty: !description && !showDetails})}
        ref='details'
        name='post'
        content={description}
        onChange={ev => this.setDelayed('description', ev.target.value)}
        onKeyUp={this.goBackToTitle}
        onAddTag={this.handleAddTag}
        onBlur={() => this.setState({showDetails: false})}/>
      {!description && !showDetails &&
        <div className='details-placeholder' onClick={this.goToDetails}>
          More details
        </div>}

      {!isEvent && <Dropdown className='hashtag-selector' toggleChildren={
        <button>
          #{tag === 'chat' ? 'all-topics' : tag}&nbsp;
          <span className='caret'></span>
        </button>
      }>
        <li><a onClick={() => selectTag('request')}>#request</a></li>
        <li><a onClick={() => selectTag('offer')}>#offer</a></li>
        <li><a onClick={() => selectTag('chat')}>#all-topics</a></li>
      </Dropdown>}

      {isEvent && <EventSection postEdit={postEdit}
        update={this.updateStore}/>}

      {!project && <div className='communities'>
        in&nbsp;
        <CommunitySelector currentUser={currentUser}
          communities={communities || []}
          onSelect={this.addCommunity}
          onRemove={this.removeCommunity}/>
      </div>}

      <div className='buttons'>
        <div className='right'>
          <button onClick={this.cancel}>Cancel</button>
        </div>

        <button className='save' ref='save' onClick={this.saveIfValid}
          disabled={saving}>
          {post ? 'Save Changes' : 'Post'}
        </button>
        <AttachmentsDropdown id={this.props.id}
          media={postEdit.media}
          path={`user/${currentUser.id}/seeds`}
          imagePending={imagePending}
          dispatch={dispatch}/>
        <label className='visibility'>
          <input type='checkbox' value={postEdit.public}
            onChange={() => this.updateStore({public: !postEdit.public})}/>
          &nbsp;
          Public
        </label>
      </div>
    </div>
  }
}

class EventSection extends React.Component {
  static propTypes = {
    postEdit: object,
    update: func.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    const { postEdit, update } = this.props
    const { start_time, end_time } = postEdit
    const startTime = start_time ? new Date(postEdit.start_time) : null
    const endTime = end_time ? new Date(postEdit.end_time) : null
    const updateSlowly = debounce(update, 200)

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
        <input type='text' placeholder='hashtag'/>
      </div>
        <div className='url'>
        <Icon name='link'/>
        <input type='text' placeholder='http://'/>
      </div>
      <div className='visibility'>
        <Icon name='lock'/>
        <label>
          public
          <input type='checkbox'
            onChange={event => update({public: event.target.checked})}/>
        </label>
      </div>
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
      <span className='glyphicon glyphicon-camera'></span>
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
    currentUser: object.isRequired,
    communities: array.isRequired,
    onSelect: func.isRequired,
    onRemove: func.isRequired
  }

  render () {
    const { term } = this.state
    const {
      currentUser: { memberships },
      communities,
      onSelect,
      onRemove
    } = this.props

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
    project: object,
    community: object,
    type: string
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
    const { type, post, project, community } = this.props

    if (!this.state.expanded) {
      const { currentUser } = this.context
      return <div className='post-editor' onClick={this.toggle}>
        <PostEditorHeader person={currentUser}/>
        <div className='prompt'>
          {placeholderText(type === 'event')}
        </div>
      </div>
    }

    return <PostEditor {...{post, project, community, type}}
      onCancel={this.toggle}/>
  }
}

const placeholderText = isEvent =>
  isEvent ? 'Create an event' : 'Start a conversation'
