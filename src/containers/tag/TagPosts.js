import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetch, ConnectedPostList } from '../ConnectedPostList'
import { fetchTag, followTag, navigate } from '../../actions'
import { compose } from 'redux'
import { get } from 'lodash'
const { bool, func, object } = React.PropTypes

const subject = 'tag'

class TagPosts extends React.Component {
  static propTypes = {
    dispatch: func,
    params: object,
    location: object,
    tag: object,
    community: object,
    redirecting: bool
  }

  static childContextTypes = {
    community: object
  }

  getChildContext () {
    const { community } = this.props
    return {community}
  }

  render () {
    const {
      params: { tagName, id },
      location: { query },
      tag,
      dispatch,
      redirecting
    } = this.props

    // we check tag.id here because tag will be non-null if we're clicking a
    // link in the left nav, but it won't have an id until fetchTag returns
    if (!tag.id || redirecting) {
      return <div className='loading'>Please wait...</div>
    }

    const toggleFollow = () => dispatch(followTag(id, tagName))

    return <div>
      <div className='list-controls tag-header'>
        <span className='tag-name'>#{tagName}</span>
        {id && (tag.followed
          ? <button className='unfollow' onClick={toggleFollow}>
              Unfollow
            </button>
          : <button className='follow' onClick={toggleFollow}>
              Follow
            </button>)}
      </div>
      <ConnectedPostList {...{subject, id: tagName, query: {...query, communityId: id}}}/>
    </div>
  }
}

export default compose(
  prefetch(({ dispatch, params: { tagName, id }, query }) =>
    dispatch(fetchTag(tagName, id))
    .then(({ payload }) => payload.post
      ? dispatch(navigate(`/p/${payload.post.id}`))
      : dispatch(fetch(subject, tagName, {...query, communityId: id})))),
  connect((state, { params: { tagName, id } }) => {
    const tag = get(state, ['tagsByCommunity', id || 'all', tagName])
    return {
      tag,
      redirecting: !!get(tag, 'post.id'),
      community: get(state, ['communities', id])
    }
  })
)(TagPosts)
