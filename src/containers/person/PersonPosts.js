import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetch, ConnectedPostList } from '../ConnectedPostList'
import { refetch } from '../../util/caching'
import PostListControls from '../../components/PostListControls'
import { compose } from 'redux'
const { func, object } = React.PropTypes

const subject = 'person'

const PersonPosts = props => {
  let { dispatch, params: { id }, location: { query } } = props
  let { type, sort, search } = query

  return <div>
    <PostListControls onChange={opts => dispatch(refetch(opts, props.location))}
      type={type} sort={sort} search={search}/>
    <ConnectedPostList {...{subject, id, query}}/>
  </div>
}

PersonPosts.propTypes = {
  person: object,
  params: object,
  dispatch: func
}

export default compose(
  prefetch(({ dispatch, params, query }) => dispatch(fetch(subject, params.id, query))),
  connect((state, { params }) => ({person: state.people[params.id]}))
)(PersonPosts)
