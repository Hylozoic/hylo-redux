import React from 'react'
const { array, bool, func, object, number, string } = React.PropTypes
import { connect } from 'react-redux'
import { changeViewportTop } from '../util/scrolling'
import { filter, includes, isEmpty } from 'lodash/fp'
import { navigate, showExpandedPost } from '../actions'
import { getEditingPostIds } from '../models/post'
import { makeUrl } from '../util/navigation'
import Post from './Post'
import PostEditor from './PostEditor'
import { EventPostCard } from './EventPost'
import { ProjectPostCard } from './ProjectPost'
import ScrollListener from './ScrollListener'
import RefreshButton from './RefreshButton'
import ProjectActivityCard from './ProjectActivityCard'
import SearchInput from './SearchInput'
import Icon from './Icon'

export class PostList extends React.Component {
  static propTypes = {
    posts: array,
    parentPost: object,
    loadMore: func,
    refreshPostList: func,
    freshCount: number,
    pending: bool,
    editingPostIds: array,
    hide: array,
    dispatch: func,
    hideMobileSearch: bool,
    isMobile: bool,
    noPostsMessage: string
  }

  static contextTypes = {
    isMobile: bool
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  expand = (id, commentId) => {
    const { dispatch } = this.props
    const { isMobile } = this.context

    if (isMobile) {
      dispatch(navigate(`/p/${id}` + (commentId ? `#comment-${commentId}` : '')))
    } else {
      dispatch(showExpandedPost(id, commentId))
    }
  }

  render () {
    const {
      hide, editingPostIds, pending, loadMore, refreshPostList, freshCount,
      dispatch, hideMobileSearch, noPostsMessage, parentPost
    } = this.props
    const { isMobile } = this.context

    const posts = filter(p => !includes(p.id, hide), this.props.posts)
    const doSearch = text => dispatch(navigate(makeUrl('/search', {q: text})))

    if (!pending && posts.length === 0) {
      return <span>
        <div className='no-results'>{noPostsMessage || 'No posts to show.'}</div>
      </span>
    }

    return <div className='post-list-wrapper'>
      {isMobile && !hideMobileSearch && <MobileSearch search={doSearch} />}
      <RefreshButton refresh={refreshPostList} count={freshCount} />
      <ul className='posts'>
        {pending && isEmpty(posts) && <li className='loading'>Loading...</li>}
        {posts.map(post =>
          <li key={post.id} ref={post.id}>
            <ShowPost {...{post, parentPost, editingPostIds}} />
          </li>
        )}
      </ul>
      {pending && !isEmpty(posts) && <div className='paginating'>Loading more...</div>}
      {loadMore && <ScrollListener onBottom={loadMore} padding={5} />}
    </div>
  }
}

export default connect((state, { posts }) => ({
  editingPostIds: state.isMobile ? [] : getEditingPostIds(posts, state)
}))(PostList)

const ShowPost = ({ post, parentPost, editingPostIds }) => {
  const onExpand = commentId => this.expand(post.id, commentId)
  if (includes(post.id, editingPostIds)) {
    return <PostEditor {...{post, parentPost}} expanded />
  }
  switch (post.type) {
    case 'event':
      return <EventPostCard {...{post, parentPost}} />
    case 'project':
      return <ProjectPostCard {...{post, parentPost}} />
    case 'project-activity':
      return <ProjectActivityCard post={post} onExpand={onExpand} />
    case 'module':
      return post.component
  }
  return <Post {...{post, parentPost, onExpand}} />
}

class MobileSearch extends React.Component {
  static propTypes = {
    search: func
  }

  componentDidMount () {
    changeViewportTop(40)
    this.refs.mobileSearch.className = 'mobile-search'
  }

  render () {
    const { search } = this.props
    return <div className='mobile-search hidden' ref='mobileSearch'>
      <Icon name='Loupe' />
      <SearchInput onChange={search} />
    </div>
  }
}
