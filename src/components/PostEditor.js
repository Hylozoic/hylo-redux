/*

N.B.: in the database, Post has columns called "name" and "description".
Below, we use "title" and "details" instead for CSS and user-facing text,
because they make more sense.

*/

import React from 'react'
import { contains, curry, filter, find, startsWith } from 'lodash'
import cx from 'classnames'
import TagInput from './TagInput'
import Dropdown from './Dropdown'
import RichTextEditor from './RichTextEditor'
import { connect } from 'react-redux'
import { typeahead, updatePostEditor, createPost, updatePost, cancelPostEdit, removeImage } from '../actions'
import { uploadImage, UPLOAD_IMAGE } from '../actions/uploadImage'
import { uploadDoc, UPLOAD_DOC } from '../actions/uploadDoc'
import { attachmentParams } from '../util/shims'
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
  let communities, context
  if (post) {
    context = post.id
  } else {
    communities = community ? [community.id] : []
    context = NEW_POST_CONTEXT
  }

  return {
    communities,
    mentionChoices: state.typeaheadMatches.post,
    currentUser: state.people.current,
    ...state.postsInProgress[context],
    context,
    imagePending: state.pending[UPLOAD_IMAGE],
    docPending: state.pending[UPLOAD_DOC]
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
    imagePending: bool,
    docPending: bool,
    // post attributes below -- maybe nest these?
    name: string,
    type: string,
    description: string,
    location: string,
    community: object,
    communities: array,
    public: bool,
    media: array
  }

  updateStore (data) {
    let { context, dispatch } = this.props
    dispatch(updatePostEditor(data, context))
  }

  selectType = (type, event) =>
    this.updateStore({type: type})

  expand = () =>
    this.props.expanded || this.updateStore({expanded: true})

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

  setLocation = event => this.updateStore({location: event.target.value})

  addCommunity = community =>
    this.updateStore({communities: this.props.communities.concat(community.id)})

  removeCommunity = community =>
    this.updateStore({communities: filter(this.props.communities, cid => cid !== community.id)})

  togglePublic = () =>
    this.updateStore({public: !this.props.public})

  validate () {
    if (!this.props.name) {
      window.alert('The title of a post cannot be blank.')
      this.refs.name.focus()
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
      let {
        dispatch, context, post,
        name, description, type, location, communities, media
      } = this.props

      let params = {
        name, description, communities, location,
        type: type || 'chat',
        public: this.props.public,
        ...attachmentParams(post && post.media, media)
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

    let { currentUser, communities } = this.props
    var match = c =>
      startsWith(c.name.toLowerCase(), term.toLowerCase()) &&
      !contains(communities, c.id)

    return filter(currentUser.memberships.map(m => m.community), match)
  }

  mentionTemplate = person => {
    return <a data-user-id={person.id} href={'/u/' + person.id}>{person.name}</a>
  }

  mentionTypeahead = text => {
    if (text) {
      this.props.dispatch(typeahead({text: text, context: 'post'}))
    } else {
      this.props.dispatch(typeahead({cancel: true, context: 'post'}))
    }
  }

  attachImage = () => {
    let { currentUser, context, dispatch } = this.props

    dispatch(uploadImage({
      context,
      path: `user/${currentUser.id}/seeds`,
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

  render () {
    let {
      name, description, location, expanded, communities, post, imagePending, media
    } = this.props

    var selectedType = this.props.type || 'chat'
    var placeholder = postTypeData[selectedType].placeholder
    let image = find(media, m => m.type === 'image')

    let isEvent = this.props.type === 'event'

    return <div className={cx('post-editor', 'clearfix', {expanded: expanded})}>
      {post && <h3>Editing Post</h3>}
      <ul className='left post-types'>
        {postTypes.map(type => <li key={type}
          className={cx('post-type', type, {selected: type === selectedType})}
          onClick={curry(this.selectType)(type)}>
          {type}
        </li>)}
      </ul>

      <input type='text' ref='name' className='title form-control'
        placeholder={placeholder}
        onFocus={this.expand} value={name} onChange={this.setName}/>

      {expanded && <div>
        <h3>Details</h3>
        <RichTextEditor className='details'
          content={description}
          onChange={this.setDescription}
          mentionTemplate={this.mentionTemplate}
          mentionTypeahead={this.mentionTypeahead}
          mentionChoices={this.props.mentionChoices}
          mentionSelector='[data-user-id]'/>

        {isEvent && <div className='input-row'>
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
          <input type='checkbox' value={this.props.public} onChange={this.togglePublic}/>
          &nbsp;
          Make this post publicly visible
        </label>

        <div className='buttons'>
          <div className='right'>
            <button onClick={this.cancel}>Cancel</button>
            <button className='btn-primary' onClick={this.save}>
              {post ? 'Save Changes' : 'Post'}
            </button>
          </div>

          {imagePending
            ? <button disabled>Please wait...</button>
            : image
              ? <Dropdown className='change-image' toggleChildren={
                  <span>
                    Change Image
                    <img src={image.url} className='image-thumbnail'/>
                  </span>
                }>
                  <li><a onClick={this.removeImage}>Remove Image</a></li>
                  <li><a onClick={this.attachImage}>Attach Another</a></li>
                </Dropdown>

              : <button onClick={this.attachImage}>
                  Attach Image
                </button>}

          <button onClick={this.attachDoc}>Attach File with Google Drive</button>
        </div>
      </div>}
    </div>
  }
}

// post.communities is a list of ids, but the tag input needs
// names and icons as well, so this component does the mapping
@connect(({ communities }, { ids }) => ({
  communities: ids.map(id => find(communities, c => c.id === id))
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
