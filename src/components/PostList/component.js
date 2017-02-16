import React from 'react'
import { filter, includes, isEmpty } from 'lodash/fp'
import { changeViewportTop } from '../../util/scrolling'
import { makeUrl } from '../../util/navigation'
import Post from '../Post'
import PostEditor from '../PostEditor'
import EventPostCard from '../EventPostCard'
import ProjectPostCard from '../ProjectPostCard'
import ScrollListener from '../ScrollListener'
import RefreshButton from '../RefreshButton'
import ProjectActivityCard from '../ProjectActivityCard'
import SearchInput from '../SearchInput'
import Icon from '../Icon'

const { array, bool, func, object, number, string } = React.PropTypes

export default class PostList extends React.Component {
  static propTypes = {
    posts: array.isRequired,
    navigate: func.isRequired,
    showExpandedPost: func.isRequired,
    parentPost: object,
    loadMore: func,
    refreshPostList: func,
    freshCount: number,
    pending: bool,
    editingPostIds: array,
    hide: array,
    hideMobileSearch: bool,
    isMobile: bool,
    noPostsMessage: string,
    showProjectActivity: bool
  }

  static contextTypes = {
    isMobile: bool
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  expand = (id, commentId, parentPostId) => {
    const { navigate, showExpandedPost } = this.props
    const { isMobile } = this.context

    if (isMobile || parentPostId) {
      navigate(`/p/${id}` + (commentId ? `#comment-${commentId}` : ''))
    } else {
      showExpandedPost(id, commentId)
    }
  }

  render () {
    const {
      hide, editingPostIds, pending, loadMore, refreshPostList, freshCount,
      hideMobileSearch, noPostsMessage, parentPost, showProjectActivity, navigate
    } = this.props
    const { isMobile } = this.context
    const expand = this.expand

    const posts = filter(p => !includes(p.id, hide), this.props.posts)
    const doSearch = text => navigate(makeUrl('/search', {q: text}))

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
            <ShowPost {...{post, parentPost, editingPostIds, expand, showProjectActivity}} />
          </li>
        )}
      </ul>
      {pending && !isEmpty(posts) && <div className='paginating'>Loading more...</div>}
      {loadMore && <ScrollListener onBottom={loadMore} padding={5} />}
    </div>
  }
}

function ShowPost ({ showProjectActivity, post, parentPost, editingPostIds, expand }) {
  let onExpand = commentId => {
    return expand(post.id, commentId, post.parent_post_id)
  }
  if (includes(post.id, editingPostIds)) {
    return <PostEditor {...{post, parentPost}} expanded />
  } else if (showProjectActivity && post.type === 'project' && post.child_id) {
    onExpand = commentId => expand(post.child_id, commentId, post.id)
    return <ProjectActivityCard postId={post.child_id} parentPost={post} onExpand={onExpand} />
  }
  switch (post.type) {
    case 'event':
      return <EventPostCard {...{post, parentPost}} />
    case 'project':
      return <ProjectPostCard {...{post, parentPost}} />
    case 'module':
      return post.component
    default:
      return <Post {...{post, parentPost, onExpand}} />
  }
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
