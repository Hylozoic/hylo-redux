import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { capitalize } from 'lodash'
import { navigate, CREATE_POST, UPDATE_POST } from '../actions'
import { fetchCommunity } from '../actions/communities'
import { fetchPost, startPostEdit } from '../actions/posts'
import { getCommunities, getPost } from '../models/post'
import { getCommunity } from '../models/community'
import { PostEditor, newPostId } from '../components/PostEditor'
import { browserHistory } from 'react-router'
const { func, object, bool } = React.PropTypes

export const editorUrl = (slug, type) => {
  const start = `${slug ? `/c/${slug}` : '/p'}`
  const end = `${type ? `/${type}s` : ''}/new`
  return start + end
}

@prefetch(({ store, routes, dispatch, params: { id } }) =>
  (routes.slice(-1)[0].community
    ? dispatch(fetchCommunity(id))
    : id && dispatch(fetchPost(id))
      .then(() => {
        const post = getPost(id, store.getState())
        return dispatch(startPostEdit(post))
      })))
@connect((state, { route, params: { id } }) => {
  const saving = state.pending[CREATE_POST] || state.pending[UPDATE_POST]
  if (route.community) {
    return {
      postEdit: state.postEdits[newPostId] || {},
      community: getCommunity(id, state),
      saving
    }
  } else {
    const post = getPost(id, state)
    return {
      post,
      postEdit: state.postEdits[id || newPostId],
      communities: post ? getCommunities(post, state) : null,
      saving
    }
  }
})
export default class StandalonePostEditor extends React.Component {
  static propTypes = {
    post: object,
    postEdit: object,
    dispatch: func,
    community: object,
    route: object,
    saving: bool,
    params: object
  }

  render () {
    const {
      post, postEdit, dispatch, community, route: { type }, saving,
      params: { id }
    } = this.props
    const { editor } = this.refs
    if (!postEdit && id) return <div className='loading'>Loading...</div>

    const goBack = () => {
      if (window.history && window.history.length > 2) {
        browserHistory.goBack()
      } else {
        dispatch(navigate(post ? `/p/${post.id}` : '/app'))
      }
    }
    return <div className='standalone-post-editor'>
      <div id='mobile-top-bar'>
        {saving
          ? <a className='right'>Saving...</a>
          : <a className='right' onClick={() => editor.saveIfValid()}>Save</a>}

        <a className='back' onClick={() => editor.cancel()}>
          <span className='left-angle-bracket'>&#x3008;</span>
          Back
        </a>
        <div className='title'>
          {post ? 'Editing' : 'New'} {capitalize(type || 'post')}
        </div>
      </div>
      <PostEditor post={post} community={community} type={type} ref='editor'
        onCancel={goBack}/>
    </div>
  }
}
