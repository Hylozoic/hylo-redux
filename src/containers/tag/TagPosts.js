import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetch, ConnectedPostList } from '../ConnectedPostList'
import { FETCH_TAG, fetchTag, navigate } from '../../actions'
import { followTag, showShareTag } from '../../actions/tags'
import { compose } from 'redux'
import { get, sortBy } from 'lodash'
import PostEditor from '../../components/PostEditor'
import Icon from '../../components/Icon'
import Avatar from '../../components/Avatar'
import Dropdown from '../../components/Dropdown'
import PersonDropdownItem from '../../components/PersonDropdownItem'
import AccessErrorMessage from '../../components/AccessErrorMessage'
import { canInvite } from '../../models/currentUser'
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

    if (get(tagError, 'meta.tagName') === tagName) {
      return <AccessErrorMessage error={tagError.payload.response}/>
    }

    // we check tag.id here because tag will be non-null if we're clicking a
    // link in the left nav, but it won't have an id until fetchTag returns
    if (!tag || !tag.id || redirecting) {
      return <div className='loading'>Please wait...</div>
    }
    const { owner, followers } = tag

    const toggleFollow = () => dispatch(followTag(id, tagName))

    return <div>
      {currentUser && <PostEditor community={community} tag={tagName}/>}
      <div className='list-controls tag-header'>
        <span className='title'>
          <span className='tag-name'>#{tagName}</span>
          {!isMobile && owner && <span className='byline'>by {owner.name}</span>}
        </span>
        {!isMobile && followers && <Followers followers={sortBy(followers, f => f.id !== owner.id)} />}
        {id && <button className={tag.followed ? 'unfollow' : 'follow'} onClick={toggleFollow}>
          {tag.followed ? 'Unfollow' : 'Follow'}
        </button>}
        {canInvite(currentUser, community) &&
          <button className='share' onClick={() => dispatch(showShareTag(tagName, id))}><Icon name='Box-Out'/></button>}
      </div>
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
    const tag = get(state, ['tagsByCommunity', id || 'all', tagName])
    return {
      isMobile: state.isMobile,
      tag,
      redirecting: !!get(tag, 'post.id'),
      community: get(state, ['communities', id]),
      tagError: state.errors[FETCH_TAG]
    }
  })
)(TagPosts)

const Followers = ({followers}) => {
  return <div className='followers'>
    <span>
      Followed by
    </span>
    {followers.slice(0, 3).map(follower => <Avatar key={follower.id} person={follower} />)}
    {followers.length > 3 && <Dropdown toggleChildren={
      <span className='plus-button'>
        <span className='content'>+{followers.length - 3}</span>
      </span>}>
      {followers.slice(3).map(follower => <PersonDropdownItem person={follower}/>)}
    </Dropdown>}
  </div>
}
