import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetch, ConnectedPostList } from '../ConnectedPostList'
import { fetchTag } from '../../actions'
import { compose } from 'redux'
import { get } from 'lodash'
const { func, object } = React.PropTypes

const subject = 'tag'

const TagPosts = props => {
  let { params: { tagName, id }, location: { query } } = props

  return <div>
    <div className='list-controls tag-header'>
      <span className='tag-name'>#{tagName}</span>
    </div>
    <ConnectedPostList {...{subject, id: tagName, query: {...query, communityId: id}}}/>
  </div>
}

TagPosts.propTypes = {
  dispatch: func,
  params: object,
  location: object
}

export default compose(
  prefetch(({ dispatch, params: { tagName, id }, query }) => {
    dispatch(fetchTag(id, tagName))
    return dispatch(fetch(subject, tagName, {...query, communityId: id}))
  }),
  connect((state, { params: { tagName, id } }) => ({tag: get(state, [`tagsByCommunity`, id, tagName])}))
)(TagPosts)
