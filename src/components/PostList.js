import { throttle } from 'lodash'
import { isAtBottom } from '../util/scrolling'
import React from 'react'
import Post from './Post'

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

  handleScrollEvents = throttle(event => {
    event.preventDefault()
    if (isAtBottom(250)) this.props.loadMore()
  }, 50)

  componentDidMount () {
    window.addEventListener('scroll', this.handleScrollEvents)
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this.handleScrollEvents)
  }

  expand = (id) => {
    this.setState({expanded: id})
  }

  render () {
    let { posts, pending } = this.props

    if (!pending && posts.length === 0) {
      return <div className='no-posts'>No posts to show.</div>
    }

    return <ul className='posts'>
      {pending && <li className='loading'>Loading...</li>}
      {posts.map(p => <li key={p.id}>
        <Post post={p} expanded={p.id === this.state.expanded} onExpand={this.expand}/>
      </li>)}
    </ul>
  }
}

export default PostList
