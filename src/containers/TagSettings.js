import React from 'react'
import { compose } from 'redux'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { fetchTags, removeTagFromCommunity } from '../actions/tags'
import { getCurrentCommunity } from '../models/community'
import A from '../components/A'
import Icon from '../components/Icon'
import ScrollListener from '../components/ScrollListener'
import { connectedListProps } from '../util/caching'

const subject = 'community'

const TagSettings = ({ tags, community, dispatch, pending, total }) => {
  const { slug } = community
  const offset = tags.length
  const loadMore = !pending && offset < total
    ? () => dispatch(fetchTags({subject, id: slug, offset}))
    : () => {}
  const remove = tag =>
    window.confirm('Are you sure? This cannot be undone.') &&
      dispatch(removeTagFromCommunity(tag, slug))

  return <div id='topic-settings'>
    <h2>Manage Topics</h2>
    <p className='meta'>
      Removing a topic from this community prevents it from appearing in lists,
      but does not change or erase any posts or comments.
    </p>
    {tags.map(tag => <div key={tag.id} className='topic-row'>
      <div className='right'>
        <A to={`/c/${slug}/tag/${tag.name}`}>
          <Icon name='View'/>
        </A>
        <a onClick={() => remove(tag)}>
          <Icon name='Trash'/>
        </a>
      </div>
      {tag.name}
      {tag.post_type && <span className='topic-post-type'>
        {tag.post_type}
      </span>}
    </div>)}
    <ScrollListener onBottom={loadMore}/>
  </div>
}

export default compose(
  prefetch(({ params: { id }, dispatch }) =>
    dispatch(fetchTags({subject, id}))),
  connect((state, { params: { id }, location: { query } }) => {
    return ({
      ...connectedListProps(state, {subject, id, query}, 'tags'),
      community: getCurrentCommunity(state)
    })
  })
)(TagSettings)
