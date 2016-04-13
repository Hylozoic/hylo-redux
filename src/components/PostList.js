import React from 'react'
import Post from './Post'
import ScrollListener from './ScrollListener'
import RefreshButton from './RefreshButton'
import { changeViewportTop, positionInViewport } from '../util/scrolling'
import { includes } from 'lodash'
import PostEditor from './PostEditor'
import { EventPostCard } from './EventPost'

const { array, bool, func, object, string } = React.PropTypes

class PostList extends React.Component {
  static propTypes = {
    posts: array,
    loadMore: func,
    refreshPostList: func,
    pending: bool,
    editingPostIds: array
  }

  static contextTypes = {
    project: object,
    postDisplayMode: string
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  expand = (id) => {
    this.setState({expanded: id})
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
    let { posts, editingPostIds, pending, loadMore, refreshPostList } = this.props
    let { project } = this.context

    if (!pending && posts.length === 0) {
      return <div className='no-posts'>No posts to show.</div>
    }

    const showPost = post => {
      if (includes(editingPostIds, post.id)) {
        return <PostEditor post={post} expanded={true} project={project}/>
      }

      if (post.id === this.state.expanded) {
        return <div>
          <div className='backdrop' onClick={this.unexpand}/>
          <Post post={post} expanded={true}/>
        </div>
      }

      if (post.type === 'event') {
        return <EventPostCard post={post}/>
      }

      return <Post post={post} onExpand={() => this.expand(post.id)}/>
    }

    return <span>
      <RefreshButton refresh={refreshPostList} />
      <ul className='posts'>
      {pending && <li className='loading'>Loading...</li>}
      {posts.map(p => <li key={p.id} ref={p.id}>
        {showPost(p)}
      </li>)}
      <ScrollListener onBottom={loadMore}/>
    </ul>
    </span>
  }
}

export default PostList
