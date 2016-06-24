import React from 'react'
import { connect } from 'react-redux'
import Post from './Post'
import ScrollListener from './ScrollListener'
import RefreshButton from './RefreshButton'
import { changeViewportTop, positionInViewport } from '../util/scrolling'
import { filter, includes } from 'lodash/fp'
import PostEditor from './PostEditor'
import { EventPostCard } from './EventPost'
import { ProjectPostCard } from './ProjectPost'
import { getEditingPostIds } from '../models/post'
import { isMobile } from '../client/util'
import { makeUrl } from '../util/navigation'
import { navigate } from '../actions'
import SearchInput from './SearchInput'
import Icon from './Icon'

const { array, bool, func, string, object } = React.PropTypes

@connect((state, props) => ({
  editingPostIds: isMobile() ? [] : getEditingPostIds(props.posts, state),
  isMobile: state.isMobile
}))
class PostList extends React.Component {
  static propTypes = {
    posts: array,
    loadMore: func,
    refreshPostList: func,
    freshCount: object,
    pending: bool,
    editingPostIds: array,
    hide: array,
    dispatch: func,
    hideMobileSearch: bool,
    isMobile: bool
  }

  static contextTypes = {
    postDisplayMode: string
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  expand = (id) => {
    let { dispatch } = this.props

    if (isMobile()) {
      dispatch(navigate(`/p/${id}`))
    } else {
      this.setState({expanded: id})
    }
  }

  unexpand = event => {
    this.setState({expanded: null})
  }

  componentWillUpdate (nextProps, nextState) {
    if (!this.state.expanded && nextState.expanded) {
      const node = this.refs[nextState.expanded]
      this.initialHeight = node.offsetHeight
      return
    }

    if (this.state.expanded && nextState.expanded !== this.state.expanded) {
      const node = this.refs[this.state.expanded]
      const nodeY = positionInViewport(node).y
      if (nodeY + this.initialHeight < 0) {
        changeViewportTop(nodeY - 30)
      }
    }
  }

  render () {
    let { hide, editingPostIds, pending, loadMore, refreshPostList, freshCount, dispatch, hideMobileSearch, isMobile } = this.props
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

      if (post.id === this.state.expanded) {
        return <div>
          <div className='backdrop' onClick={this.unexpand}/>
          <Post post={post} expanded/>
        </div>
      }

      switch (post.type) {
        case 'event':
          return <EventPostCard post={post}/>
        case 'project':
          return <ProjectPostCard post={post}/>
      }

      return <Post post={post} onExpand={() => this.expand(post.id)}/>
    }

    return <span>
      {isMobile && !hideMobileSearch && <MobileSearch search={doSearch}/>}
      <RefreshButton refresh={refreshPostList} count={freshCount}/>
      <ul className='posts'>
      {pending && <li className='loading'>Loading...</li>}
      {posts.map(p => <li key={p.id} ref={p.id}>
        {showPost(p)}
      </li>)}
      {loadMore && <ScrollListener onBottom={loadMore}/>}
    </ul>
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
