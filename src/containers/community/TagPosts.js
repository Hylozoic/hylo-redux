import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetch, ConnectedPostList } from '../ConnectedPostList'
import { refetch } from '../../util/caching'
import PostListControls from '../../components/PostListControls'
import { compose } from 'redux'
const { func, object } = React.PropTypes

const subject = 'tag'

const TagPosts = props => {
  let { dispatch, params: { tagName, id }, location: { query } } = props
  let { type, sort, search } = query

  return <div>
    <PostListControls onChange={opts => dispatch(refetch(opts, props.location))} includeWelcome={true}
      type={type} sort={sort} search={search}/>
    <ConnectedPostList {...{subject, id: tagName, query: {...query, communityId: id}}}/>
  </div>
}

TagPosts.propTypes = {
  dispatch: func,
  params: object,
  location: object
}

export default compose(
  prefetch(({ dispatch, params: { tagName, id }, query }) =>
    dispatch(fetch(subject, tagName, {...query, communityId: id}))),
  connect((state, { params }) => ({tag: {}})) // this will come from state
)(TagPosts)
