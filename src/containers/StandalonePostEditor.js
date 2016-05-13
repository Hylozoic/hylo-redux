import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { capitalize } from 'lodash'
import { fetchCommunity, fetchPost, navigate, startPostEdit } from '../actions'
import { getCommunities, getPost } from '../models/post'
import { getCommunity } from '../models/community'
import { PostEditor, newPostId } from '../components/PostEditor'
import createHistory from 'history/lib/createBrowserHistory'
const { func, object } = React.PropTypes

export const editorUrl = (slug, type) => {
  const start = `${slug ? `/c/${slug}` : '/p'}`
  const end = `${type ? `/${type}s` : ''}/new`
  return start + end
}

export const matchEditorUrl = path =>
  path.match(/^\/p\/\d+\/edit$/) ||
  path.match(/^\/(c\/[^\/]+|p)\/((events|projects)\/)?new$/)

@prefetch(({ store, routes, dispatch, params: { id } }) =>
  (routes.slice(-1)[0].community
    ? dispatch(fetchCommunity(id))
    : dispatch(fetchPost(id))
      .then(() => {
        const post = getPost(id, store.getState())
        return dispatch(startPostEdit(post))
      })))
@connect((state, { route, params: { id } }) => {
  if (route.community) {
    return {
      postEdit: state.postEdits[newPostId] || {},
      community: getCommunity(id, state)
    }
  } else {
    const post = getPost(id, state)
    return {
      post,
      postEdit: state.postEdits[id],
      communities: getCommunities(post, state)
    }
  }
})
export default class StandalonePostEditor extends React.Component {
  static propTypes = {
    post: object,
    postEdit: object,
    dispatch: func,
    community: object,
    route: object
  }

  render () {
    const { post, postEdit, dispatch, community, route: { type } } = this.props
    const { editor } = this.refs
    if (!postEdit) return <div className='loading'>Loading...</div>

    const goBack = () => {
      if (window.history && window.history.length > 2) {
        createHistory().goBack()
      } else {
        dispatch(navigate(`/p/${post.id}`))
      }
    }
    return <div className='standalone-post-editor'>
      <div className='top-menu'>
        <a className='save' onClick={() => editor.saveIfValid()}>Save</a>
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
