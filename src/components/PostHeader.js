import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { sortBy } from 'lodash'
import { humanDate, nonbreaking } from '../util/text'
import { isChildPost } from '../models/post'
import { handleMouseOver } from './Popover'
import A from './A'
import Avatar from './Avatar'
import Dropdown from './Dropdown'
import PostMenu from './PostMenu'

export function PostHeader (
  { post, parentPost, communities, expanded, onMouseOver },
  { currentUser, community }
) {
  const { tag } = post
  const person = tag === 'welcome' ? post.relatedUsers[0] : post.user
  const createdAt = new Date(post.created_at)
  const isChild = isChildPost(post)
  return <div className='header'>
    <PostMenu expanded={expanded} post={post} isChild={isChild} />
    <Avatar person={person} showPopover />
    {tag === 'welcome'
      ? <WelcomePostHeader person={post.relatedUsers[0]} community={communities[0]} />
      : <div onMouseOver={onMouseOver}>
        <A className='name' to={`/u/${person.id}`}>
          {person.name}
        </A>
        <span className='meta'>
          <A to={`/p/${post.id}`} title={createdAt}>
            {nonbreaking(humanDate(createdAt))}
          </A>
          {(communities || parentPost) &&
            <AppearsIn community={community} communities={communities} parentPost={parentPost} />}
          {post.public && <span>{spacer}Public</span>}
        </span>
      </div>}
  </div>
}
PostHeader.propTypes = {
  post: PropTypes.object,
  parentPost: PropTypes.object,
  communities: PropTypes.array,
  expanded: PropTypes.bool,
  onMouseOver: PropTypes.func
}
PostHeader.contextTypes = {
  currentUser: PropTypes.object,
  community: PropTypes.object
}
export default connect(null, (dispatch) => ({
  onMouseOver: handleMouseOver(dispatch)
}))(PostHeader)

const WelcomePostHeader = ({ person, community }) => {
  return <div>
    <strong><A to={`/u/${person.id}`}>{person.name}</A></strong> joined
    <span />
    {community ? <span>
      <A to={`/c/${community.slug}`}>{community.name}</A>.
      <span />
      <a className='open-comments'>
        Welcome them!
      </a>
    </span>
    : <span>
        a community that is no longer active.
      </span>}
  </div>
}

const AppearsIn = ({ community, communities }) => {
  console.log('appears in')
  communities = communities || []
  if (community) communities = sortBy(communities, c => c.id !== community.id)
  const { length } = communities
  if (length === 0) return null
  const communityLink = community => <A to={`/c/${community.slug}`}>{community.name}</A>

  return <span className='communities'>
    &nbsp;in&nbsp;
    {length > 0 && communityLink(communities[0])}
    {length > 1 && <span> + </span>}
    {length > 1 &&
      <Dropdown className='post-communities-dropdown'
        toggleChildren={<span>{length - 1} other{length > 2 ? 's' : ''}</span>}>
        {communities.slice(1).map(c => <li key={c.id}>{communityLink(c)}</li>)}
      </Dropdown>}
  </span>
}

const spacer = <span>&nbsp; •&nbsp; </span>
