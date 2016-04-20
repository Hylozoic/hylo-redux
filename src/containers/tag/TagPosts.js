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
    let { community } = this.props
    return {community}
  }

  render () {
    let { params: { tagName, id }, location: { query }, tag, dispatch } = this.props

    return <div>
      <div className='list-controls tag-header'>
        <span className='tag-name'>#{tagName}</span>
        {id && tag && (tag.followed
          ? <button className='unfollow' onClick={() => dispatch(followTag(id, tagName))}>Unfollow</button>
          : <button className='follow' onClick={() => dispatch(followTag(id, tagName))}>Follow</button>)}
      </div>
      <ConnectedPostList {...{subject, id: tagName, query: {...query, communityId: id}}}/>
    </div>
  }
}

export default compose(
  prefetch(({ dispatch, params: { tagName, id }, query }) => {
    if (id) dispatch(fetchTag(id, tagName))
    return dispatch(fetch(subject, tagName, {...query, communityId: id}))
  }),
  connect((state, { params: { tagName, id } }) => ({
    tag: get(state, ['tagsByCommunity', id || 'all', tagName]),
    community: get(state, ['communities', id])
  }))
)(TagPosts)
