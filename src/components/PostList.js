import React from 'react'
import Post from './Post'
import ScrollListener from './ScrollListener'

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

  render () {
    let { posts, pending, loadMore } = this.props

    if (!pending && posts.length === 0) {
      return <div className='no-posts'>No results.</div>
    }

    return <ul className='posts'>
      {pending && <li className='loading'>Loading...</li>}
      {posts.map(p => <li key={p.id}>
        <Post post={p} expanded={p.id === this.state.expanded} onExpand={this.expand}/>
      </li>)}
      <ScrollListener onBottom={loadMore}/>
    </ul>
  }
}

export default PostList
