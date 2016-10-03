import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { fetchTags, removeTagFromCommunity, updateCommunityTag } from '../actions/tags'
import { showModal } from '../actions'
import { getCurrentCommunity } from '../models/community'
import A from '../components/A'
import Icon from '../components/Icon'
import ScrollListener from '../components/ScrollListener'
import { connectedListProps } from '../util/caching'
import { includes } from 'lodash'
import { map, find } from 'lodash/fp'
const { object, bool, array, func, number } = React.PropTypes

const subject = 'community'

@prefetch(({ params: { id }, dispatch }) =>
  dispatch(fetchTags({subject, id})))
@connect((state, { params: { id }, location: { query } }) => {
  return ({
    ...connectedListProps(state, {subject, id, query}, 'tags'),
    community: getCurrentCommunity(state)
  })
})
export default class TagSettings extends React.Component {

  static propTypes = {
    dispatch: func,
    tags: array,
    community: object,
    location: object,
    pending: bool,
    total: number
  }

  createTag () {
    this.props.dispatch(showModal('tag-editor', {
      creating: true
    }))
  }

  render () {
    const { tags, community, dispatch, pending, total } = this.props
    const findMembership = tag =>
      find(m => m.community_id === community.id, tag.memberships)
    const communityTags = map(tag => ({...tag, ...findMembership(tag)}), tags)
    const { slug } = community
    const offset = tags.length
    const loadMore = !pending && offset < total
      ? () => dispatch(fetchTags({subject, id: slug, offset}))
      : () => {}
    const remove = tag =>
      window.confirm('Are you sure? This cannot be undone.') &&
        dispatch(removeTagFromCommunity(tag, slug))
    const canDelete = tag => !includes(['request', 'offer', 'intention'], tag.name)

    const updateDefault = (tag, is_default) => {
      dispatch(updateCommunityTag(tag, community, {is_default}))
    }

    return <div id='topic-settings'>
      <h2>Manage Topics</h2>
      <p className='meta'>
        Removing a topic from this community prevents it from appearing in lists,
        but does not change or erase any posts or comments.
      </p>
      {communityTags.map(tag => <div key={tag.id} className='topic-row'>
        <div className='right'>
          <A to={`/c/${slug}/tag/${tag.name}`}>
            <Icon name='View'/>
          </A>
          {canDelete(tag) && <a onClick={() => remove(tag)}>
            <Icon name='Trash'/>
          </a>}
          <input type='checkbox'
            defaultChecked={tag.is_default}
            onChange={() => updateDefault(tag, !tag.is_default)}/>
        </div>
        {tag.name}
        {tag.post_type && <span className='topic-post-type'>
          {tag.post_type}
        </span>}
      </div>)}
      <div className='topic-row add-button-row'>
        <div className='right'>
          <a className='button' onClick={() => this.createTag()}>Add Topic</a>
        </div>
      </div>
      <ScrollListener onBottom={loadMore}/>
    </div>
  }
}
