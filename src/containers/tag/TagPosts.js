import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetch, ConnectedPostList } from '../ConnectedPostList'
import { FETCH_TAG, fetchTag, navigate } from '../../actions'
import { followTag, showShareTag } from '../../actions/tags'
import { compose } from 'redux'
import { sortBy } from 'lodash'
import { get } from 'lodash/fp'
import PostEditor from '../../components/PostEditor'
import Avatar from '../../components/Avatar'
import Dropdown from '../../components/Dropdown'
import PersonDropdownItem from '../../components/PersonDropdownItem'
import AccessErrorMessage from '../../components/AccessErrorMessage'
import { canInvite } from '../../models/currentUser'
import Tooltip from '../../components/Tooltip'
const { bool, func, object } = React.PropTypes

const subject = 'community'

class TagPosts extends React.Component {
  static propTypes = {
    dispatch: func,
    params: object,
    location: object,
    tag: object,
    community: object,
    redirecting: bool,
    tagError: object,
    isMobile: bool
  }

  static childContextTypes = {
    community: object
  }

  static contextTypes = {
    currentUser: object
  }

  getChildContext () {
    const { community } = this.props
    return {community}
  }

  render () {
    const {
      params: { tagName, id }, location: { query }, tag, dispatch, redirecting,
      community, tagError, isMobile
    } = this.props
    const { currentUser } = this.context

    if (get('meta.tagName', tagError) === tagName) {
      return <AccessErrorMessage error={tagError.payload.response}/>
    }

    // we check tag.id here because tag will be non-null if we're clicking a
    // link in the left nav, but it won't have an id until fetchTag returns
    if (!tag || !tag.id || redirecting) {
      return <div className='loading'>Please wait...</div>
    }
    const { owner, followers, followerCount } = tag

    const toggleFollow = () => dispatch(followTag(id, tagName))

    return <div className='tag-posts'>
      <div className='list-controls tag-header'>
        <span className='title'>
          <span className='tag-name'>#{tagName}</span>
          {!isMobile && owner && <span className='byline'>by {owner.name}</span>}
        </span>
        {!isMobile && followers &&
          <Followers followers={sortBy(followers, f => f.id !== owner.id)}
            followerCount={followerCount}/>}
        {canInvite(currentUser, community) &&
          <button className='invite' onClick={() => dispatch(showShareTag(tagName, id))}>+</button>}
        <span className='buttons'>
          {id && <button id='follow-button'
            className={tag.followed ? 'unfollow' : 'follow'}
            onClick={toggleFollow}>
            {tag.followed ? 'Unfollow' : 'Follow'}
          </button>}
          {id && <Tooltip id='follow'
            index={3}
            arrow='right'
            position='bottom'
            parentId='follow-button'
            title='Follow Topics'>
            <p>Follow topics you’re interested in to receive an in-app notification when there is a new Conversation in that topic.</p>
          </Tooltip>}
        </span>
      </div>
      {currentUser && <PostEditor community={community} tag={tagName}/>}
      <ConnectedPostList {...{subject, id: id || 'all', query: {...query, tag: tagName}}}/>
    </div>
  }
}

export default compose(
  prefetch(({ dispatch, params: { tagName, id }, query }) => {
    return dispatch(fetchTag(tagName, id))
    .then(({ payload }) => payload.post
      ? dispatch(navigate(`/p/${payload.post.id}`))
      : dispatch(fetch(subject, id || 'all', {...query, tag: tagName})))
  }),
  connect((state, { params: { tagName, id } }) => {
    const tag = get(['tagsByCommunity', id || 'all', tagName], state)
    return {
      isMobile: state.isMobile,
      tag,
      redirecting: !!get('post.id', tag),
      community: get(['communities', id], state),
      tagError: get(FETCH_TAG, state.errors)
    }
  })
)(TagPosts)

const Followers = ({followers, followerCount}) => {
  const adjustedCount = followerCount - 3
  let displayedCount = `+${adjustedCount}`
  if (followerCount > 99) {
    if (followerCount < 1000) {
      displayedCount = '99+'
    } else {
      displayedCount = `${Math.floor(followerCount / 1000)}k`
    }
  }

  return <div className='followers'>
    <span>Followed by</span>
    {followers.slice(0, 3).map(follower => <Avatar key={follower.id} person={follower} />)}
    {followers.length > 3 && <Dropdown toggleChildren={
      <span className='plus-button'>
        <span className='content'>{displayedCount}</span>
      </span>}>
      {followers.slice(3).map(follower =>
        <PersonDropdownItem key={follower.id} person={follower}/>)}
    </Dropdown>}
  </div>
}
