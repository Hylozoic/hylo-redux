import React from 'react'
import Post from './Post'
import ScrollListener from './ScrollListener'
import { position, positionInViewport } from '../util/scrolling'

const { array, bool, func } = React.PropTypes

class PostList extends React.Component {
  static propTypes = {
    posts: array,
    loadMore: func,
    pending: bool
  }

  constructor (props) {
    super(props)
    this.state = {expanded: null}
  }

  expand = (id) => {
    this.setState({expanded: id})
  }

  componentWillUpdate (nextProps, nextState) {
    let nextExpandedId = nextState.expanded
    if (nextExpandedId && nextExpandedId !== this.state.expanded) {
      let node = this.refs[nextExpandedId]
      this.targetViewportY = positionInViewport(node).y
    }
  }

  componentDidUpdate (prevProps, prevState) {
    let expandedId = this.state.expanded
    if (expandedId && expandedId !== prevState.expanded) {
      let node = this.refs[expandedId]
      let pos = position(node)
      let newViewportTop = pos.y - this.targetViewportY
      window.scrollTo(0, newViewportTop)
    }
  }

  render () {
    let { posts, pending, loadMore } = this.props

    if (!pending && posts.length === 0) {
      return <div className='no-posts'>No posts to show.</div>
    }

    return <ul className='posts'>
      {pending && <li className='loading'>Loading...</li>}
      {posts.map(p => <li key={p.id} ref={p.id}>
        <Post post={p} expanded={p.id === this.state.expanded} onExpand={this.expand}/>
      </li>)}
      <ScrollListener onBottom={loadMore}/>
    </ul>
  }
}

export default PostList
