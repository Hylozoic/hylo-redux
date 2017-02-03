import React, { PropTypes } from 'react'
import { some } from 'lodash'
import { get } from 'lodash/fp'
import { isMobile } from '../../client/util'
import { isPinned } from '../../models/post'
import { canEditPost, canModerate } from '../../models/currentUser'
import Dropdown from '../Dropdown'

export default function PostMenu ({ post, actions, expanded, isChild }, { currentUser, community }) {
  const { pinPost, followPost, removePost, showModal, navigate, startPostEdit } = actions
  const canEdit = canEditPost(currentUser, post)
  const following = some(post.follower_ids, id => id === get('id', currentUser))
  const pinned = isPinned(post, community)
  const edit = () => isMobile()
    ? navigate(`/p/${post.id}/edit`)
    : startPostEdit(post) &&
      expanded && !isChild && showModal('post-editor', {post})
  const remove = () => window.confirm('Are you sure? This cannot be undone.') &&
    removePost(post.id)
  const pin = () => pinPost(get('slug', community), post.id)

  const toggleChildren = pinned
    ? <span className='pinned'><span className='label'>Pinned</span><span className='icon-More' /></span>
    : <span className='icon-More' />

  return <Dropdown className='post-menu' alignRight {...{toggleChildren}}>
    {canModerate(currentUser, community) && !isChild && <li>
      <a onClick={pin}>{pinned ? 'Unpin post' : 'Pin post'}</a>
    </li>}
    {canEdit && <li><a className='edit' onClick={edit}>Edit</a></li>}
    {canEdit && <li><a onClick={remove}>Remove</a></li>}
    <li>
      <a onClick={() => followPost(post.id, currentUser)}>
        Turn {following ? 'off' : 'on'} notifications for this post
      </a>
    </li>
    {/* <li>
      <a onClick={() => window.alert('TODO')}>Report objectionable content</a>
    </li> */}
  </Dropdown>
}
PostMenu.propTypes = {
  post: PropTypes.object,
  actions: PropTypes.object,
  expanded: PropTypes.bool,
  isChild: PropTypes.bool
}
PostMenu.contextTypes = {
  currentUser: PropTypes.object,
  community: PropTypes.object
}
