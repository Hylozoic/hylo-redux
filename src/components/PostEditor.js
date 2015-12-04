/*

N.B.: in the database, Post has columns called "name" and "description".
Below, we use "title" and "details" instead for CSS and user-facing text,
because they make more sense.

*/

import React from 'react'
import { contains, filter, find, isEmpty, startsWith } from 'lodash'
import cx from 'classnames'
import TagInput from './TagInput'
import Dropdown from './Dropdown'
import RichTextEditor from './RichTextEditor'
import { connect } from 'react-redux'
import {
  typeahead, updatePostEditor, createPost, updatePost, cancelPostEdit,
  removeImage, removeDoc
} from '../actions'
import { uploadImage, UPLOAD_IMAGE } from '../actions/uploadImage'
import { uploadDoc } from '../actions/uploadDoc'
import { attachmentParams } from '../util/shims'
import truncate from 'html-truncate'
import { CREATE_POST, UPDATE_POST } from '../actions'
import { personTemplate } from '../util/mentions'
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

const NEW_POST_CONTEXT = 'new'

@connect((state, { community, post }) => {
  let context = post ? post.id : NEW_POST_CONTEXT
  let postInProgress = state.postsInProgress[context] || {}

  // FIXME: this one attribute in postInProgress isn't actually a post attribute
  let { expanded } = postInProgress

  return {
    context,
    postInProgress,
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
    context: string.isRequired,
    postInProgress: object,
    community: object,
    saving: bool
  }

  updateStore (data) {
    let { context, dispatch } = this.props
    dispatch(updatePostEditor(data, context))
  }

  selectType = (type, event) =>
    this.updateStore({type: type})

  expand = () => {
    if (this.props.expanded) return
    this.updateStore({expanded: true})

    // initialize the communities list when opening the editor in a community
    let { community, postInProgress: { communities } } = this.props
    if (community && isEmpty(communities)) this.addCommunity(community)
  }

  cancel = () => {
    let { dispatch, context, post } = this.props
    if (context === NEW_POST_CONTEXT) {
      this.updateStore({expanded: false})
    } else {
      dispatch(cancelPostEdit(post.id))
    }
  }

  setName = event =>
    this.updateStore({name: event.target.value})

  setDescription = event => this.updateStore({description: event.target.value})

  addCommunity = community => {
    let { communities } = this.props.postInProgress
    this.updateStore({communities: (communities || []).concat(community.id)})
  }

  setLocation = event => this.updateStore({location: event.target.value})

  removeCommunity = community => {
    let { communities } = this.props.postInProgress
    this.updateStore({communities: filter(communities, cid => cid !== community.id)})
  }

  togglePublic = () =>
    this.updateStore({public: !this.props.postInProgress.public})

  validate () {
    let { postInProgress } = this.props

    if (!postInProgress.name) {
      window.alert('The title of a post cannot be blank.')
      this.refs.name.focus()
      return
    }

    if (isEmpty(postInProgress.communities)) {
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
      let { dispatch, context, post, postInProgress } = this.props

      postInProgress = {
        ...postInProgress,
        type: postInProgress.type || 'chat'
      }

      let params = {
        ...postInProgress,
        ...attachmentParams(post && post.media, postInProgress.media)
      }

      if (post) {
        dispatch(updatePost(post.id, params))
      } else {
        dispatch(createPost(params, context))
      }
    })
  }

  findCommunities = term => {
    if (!term) return

    let { currentUser, postInProgress: { communities } } = this.props
    var match = c =>
      startsWith(c.name.toLowerCase(), term.toLowerCase()) &&
      !contains(communities, c.id)

    return filter(currentUser.memberships.map(m => m.community), match)
  }

  render () {
    let { expanded, post, postInProgress, dispatch } = this.props
    let { name, description, communities, type, location } = postInProgress
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

        <h3 className='communities-header'>Communities</h3>
        <CommunityTagInput ids={communities}
          getChoices={this.findCommunities}
          onSelect={this.addCommunity}
          onRemove={this.removeCommunity}/>

        <label className='visibility'>
          <input type='checkbox' value={postInProgress.public} onChange={this.togglePublic}/>
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

          <AttachmentButtons context={this.props.context} media={postInProgress.media}
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
    context: string,
    media: array,
    path: string
  }

  attachImage = () => {
    let { context, dispatch, path } = this.props

    dispatch(uploadImage({
      context,
      path,
      convert: {width: 800, format: 'jpg', fit: 'max', rotate: 'exif'}
    }))
  }

  removeImage = () => {
    let { context, dispatch } = this.props
    dispatch(removeImage(context))
  }

  attachDoc = () => {
    let { dispatch, context } = this.props
    dispatch(uploadDoc(context))
  }

  removeDoc = doc => {
    let { dispatch, context } = this.props
    dispatch(removeDoc(doc, context))
  }

  render () {
    let { imagePending, media } = this.props
    let image = find(media, m => m.type === 'image')
    let docs = filter(media, m => m.type === 'gdoc')

    return <div>
      {imagePending
        ? <button disabled>Please wait...</button>
        : image
          ? <Dropdown className='button change-image' toggleChildren={
              <span>
                <img src={image.url} className='image-thumbnail'/>
                Change Image <span className='caret'></span>
              </span>
            }>
              <li><a onClick={this.removeImage}>Remove Image</a></li>
              <li><a onClick={this.attachImage}>Attach Another</a></li>
            </Dropdown>

          : <button onClick={this.attachImage}>
              Attach Image
            </button>}

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

// post.communities is a list of ids, but the tag input needs
// names and icons as well, so this component does the mapping
@connect(({ communities }, { ids }) => ({
  communities: (ids || []).map(id => find(communities, c => c.id === id))
}))
class CommunityTagInput extends React.Component {
  static propTypes = {
    ids: array,
    communities: array
  }

  render () {
    let { communities, ...otherProps } = this.props
    return <TagInput tags={communities} {...otherProps}/>
  }
}
