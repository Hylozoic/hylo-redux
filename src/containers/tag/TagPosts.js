import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetch, ConnectedPostList } from '../ConnectedPostList'
import { fetchTag, followTag } from '../../actions'
import { compose } from 'redux'
import { get } from 'lodash'
const { func, object } = React.PropTypes

const subject = 'tag'

class TagPosts extends React.Component {
  static propTypes = {
    dispatch: func,
    params: object,
    location: object,
    tag: object,
    community: object
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
      dispatch
    } = this.props

    const toggleFollow = () => dispatch(followTag(id, tagName))

    return <div>
      <div className='list-controls tag-header'>
        <span className='tag-name'>#{tagName}</span>
        {id && tag && (tag.followed
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
    Promise.all([
      id && dispatch(fetchTag(id, tagName)),
      dispatch(fetch(subject, tagName, {...query, communityId: id}))
    ])),
  connect((state, { params: { tagName, id } }) => ({
    tag: get(state, ['tagsByCommunity', id || 'all', tagName]),
    community: get(state, ['communities', id])
  }))
)(TagPosts)
