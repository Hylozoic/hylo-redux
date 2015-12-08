import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetch, ConnectedPostList } from '../ConnectedPostList'
import { refetch } from '../../util/caching'
import PostEditor from '../../components/PostEditor'
import PostListControls from '../../components/PostListControls'
import { compose } from 'redux'
const { func, object } = React.PropTypes

const subject = 'community'

const CommunityPosts = props => {
  let { dispatch, community, params: { id }, location: { query } } = props
  let { type, sort, search } = query

  return <div>
    <PostEditor community={community}/>
    <PostListControls onChange={opts => dispatch(refetch(opts, props.location))} includeWelcome={true}
      type={type} sort={sort} search={search}/>
    <ConnectedPostList {...{subject, id, query}}/>
  </div>
}

CommunityPosts.propTypes = {
  dispatch: func,
  params: object,
  community: object,
  location: object
}

export default compose(
  prefetch(({ dispatch, params, query }) => dispatch(fetch(subject, params.id, query))),
  connect((state, { params }) => ({community: state.communities[params.id]}))
)(CommunityPosts)
