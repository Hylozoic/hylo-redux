import React from 'react'
import Post from './Post'
import ScrollListener from './ScrollListener'
import RefreshButton from './RefreshButton'
import { changeViewportTop, positionInViewport } from '../util/scrolling'
import { includes } from 'lodash'
import PostEditor from './PostEditor'

const { array, bool, func, object } = React.PropTypes

class PostList extends React.Component {
  static propTypes = {
    posts: array,
    loadMore: func,
    refreshPostList: func,
    pending: bool,
    editingPostIds: array
  }

  static contextTypes = {
    project: object
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

    return <span>
      <RefreshButton refresh={refreshPostList} />
      <ul className='posts'>
      {pending && <li className='loading'>Loading...</li>}
      {posts.map(p => <li key={p.id} ref={p.id}>
        {includes(editingPostIds, p.id)
          ? <PostEditor post={p} expanded={true} project={project}/>
          : p.id === this.state.expanded
            ? <div>
                <div className='backdrop' onClick={this.unexpand}/>
                <Post post={p} expanded={true}/>
              </div>
            : <Post post={p} onExpand={() => this.expand(p.id)}/>}
      </li>)}
      <ScrollListener onBottom={loadMore}/>
    </ul>
    </span>
  }
}

export default PostList
