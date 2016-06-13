import React from 'react'
import { connect } from 'react-redux'
import { getCurrentCommunity, getFollowedTags } from '../models/community'
import { connectedListProps } from '../util/caching'
import { closeModal } from '../actions'
import { fetchTags, followTag } from '../actions/tags'
import ScrollListener from '../components/ScrollListener'
import Icon from '../components/Icon'
import A from '../components/A'
import { modalWrapperCSSId, Modal } from '../components/Modal'
import { isEmpty, some } from 'lodash'
import { find } from 'lodash/fp'
import { same } from '../models'
import { humanDate } from '../util/text'
const { array, bool, func, number, object } = React.PropTypes

const subject = 'community'

@connect(state => {
  const community = getCurrentCommunity(state)
  return {
    community,
    ...connectedListProps(state, {subject, id: community.slug}, 'tags'),
    followedTags: getFollowedTags(community, state)
  }
})
export default class BrowseTopicsModal extends React.Component {
  static propTypes = {
    dispatch: func,
    tags: array,
    community: object,
    pending: bool,
    total: number,
    followedTags: array,
    onCancel: func
  }

  componentDidMount () {
    const { dispatch, community } = this.props
    dispatch(fetchTags({subject, id: community.slug}))
  }

  render () {
    const {
      tags, community, dispatch, pending, total, followedTags, onCancel
    } = this.props
    const offset = tags.length
    const title = total ? `Browse all ${total} topics` : 'Browse all topics'
    const loadMore = !pending && offset < total
      ? () => dispatch(fetchTags({subject, id: community.slug, offset}))
      : () => {}

    return <Modal title={title} id='browse-all-topics' onCancel={onCancel}>
      {isEmpty(tags) ? <div className='loading'>Loading...</div>
        : <ul>
            {tags.map(tag => {
              const followed = some(followedTags, same('name', tag))
              return <TagRow tag={tag} community={community} key={tag.id}
                followed={followed}/>
            })}
          </ul>}
      <ScrollListener elementId={modalWrapperCSSId}
        onBottom={loadMore}/>
    </Modal>
  }
}

const TagRow = ({ tag, community, followed }, { isMobile }) => {
  const { id, name, post_type } = tag
  const { slug } = community
  const membership = find(m => same('id', community), tag.memberships)
  const { description, follower_count, owner, created_at } = membership

  return <li key={id}>
    {!isMobile && <TagRowControls {...{follower_count, slug, followed, name}}/>}
    <span className='name'>#{name}</span>
    {(description || post_type) && <p className='description'>
      {description || post_type}
    </p>}
    {!isEmpty(owner) && <span className='meta'>
      created by {owner.name} {humanDate(created_at)}
    </span>}
    {isMobile && <TagRowControls {...{follower_count, slug, followed, name}}/>}
  </li>
}
TagRow.contextTypes = {isMobile: bool}

const TagRowControls = ({ followed, follower_count, slug, name }, { dispatch }) => {
  const unfollow = () => dispatch(followTag(slug, name))
  return <div className='right'>
    <span className='followers'>
      <Icon name='Users'/>
      {follower_count}
    </span>
    {followed
      ? <a className='unfollow button' onClick={unfollow}>
          Unfollow <span className='x'>&times;</span>
        </a>
      : <A className='view button' to={`/c/${slug}/tag/${name}`}
          onClick={() => dispatch(closeModal())}>
          View <Icon name='View'/>
        </A>}
  </div>
}
TagRowControls.contextTypes = {dispatch: func}
