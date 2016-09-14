import React from 'react'
import { connect } from 'react-redux'
import Post from './Post'
import ScrollListener from './ScrollListener'
import RefreshButton from './RefreshButton'
import { changeViewportTop } from '../util/scrolling'
import { filter, includes, isEmpty } from 'lodash/fp'
import PostEditor from './PostEditor'
import { EventPostCard } from './EventPost'
import { ProjectPostCard } from './ProjectPost'
import { getEditingPostIds } from '../models/post'
import { makeUrl } from '../util/navigation'
import { navigate, showExpandedPost } from '../actions'
import SearchInput from './SearchInput'
import Icon from './Icon'
const { array, bool, func, number } = React.PropTypes

@connect((state, { posts }) => ({
  editingPostIds: state.isMobile ? [] : getEditingPostIds(posts, state)
}))
class PostList extends React.Component {
  static propTypes = {
    posts: array,
    loadMore: func,
    refreshPostList: func,
    freshCount: number,
    pending: bool,
    editingPostIds: array,
    hide: array,
    dispatch: func,
    hideMobileSearch: bool,
    isMobile: bool
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
      dispatch, hideMobileSearch, isMobile
    } = this.props
    const posts = filter(p => !includes(p.id, hide), this.props.posts)
    const doSearch = text => dispatch(navigate(makeUrl('/search', {q: text})))

    if (!pending && posts.length === 0) {
      return <span>
        <div className='no-results'>No posts to show.</div>
      </span>
    }

    const showPost = post => {
      if (includes(post.id, editingPostIds)) {
        return <PostEditor post={post} expanded/>
      }

      switch (post.type) {
        case 'event':
          return <EventPostCard post={post}/>
        case 'project':
          return <ProjectPostCard post={post}/>
      }

      return <Post post={post} onExpand={commentId => this.expand(post.id, commentId)}/>
    }

    return <span>
      {isMobile && !hideMobileSearch && <MobileSearch search={doSearch}/>}
      <RefreshButton refresh={refreshPostList} count={freshCount}/>
      <ul className='posts'>
        {pending && isEmpty(posts) && <li className='loading'>Loading...</li>}
        {posts.map(p => <li key={p.id} ref={p.id}>
          {showPost(p)}
        </li>)}
      </ul>
      {pending && !isEmpty(posts) && <div className='paginating'>Loading more...</div>}
      {loadMore && <ScrollListener onBottom={loadMore} padding={5}/>}
    </span>
  }
}

export default PostList

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
      <Icon name='Loupe'/>
      <SearchInput onChange={search}/>
    </div>
  }
}
