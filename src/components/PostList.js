import { throttle } from 'lodash'
import { isAtBottom } from '../util/scrolling'
import React from 'react'
import Post from './Post'

var { string, number, array } = React.PropTypes

class PostList extends React.Component {
  static propTypes = {
    posts: array,
    ownerId: string,
    type: string,
    total: number
  }

  constructor (props) {
    super(props)
    this.state = {expanded: null}
  }

  handleScrollEvents = throttle(event => {
    event.preventDefault()
    if (this.state.waitingForPosts) return
    let posts = this.props.posts
    if (this.props.total <= posts.length) return

    if (isAtBottom(250)) {
      this.state.waitingForPosts = true
      this.state.numPosts = posts.length
      this.props.loadMore()
    }
  }, 50)

  componentDidMount () {
    window.addEventListener('scroll', this.handleScrollEvents)
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this.handleScrollEvents)
  }

  componentDidUpdate (prevProps, prevState) {
    if (!this.state.waitingForPosts) return
    if (this.props.posts.length > this.state.numPosts) {
      this.state.waitingForPosts = false
    }
  }

  expand = (id) => {
    this.setState({expanded: id})
  }

  render () {
    return <ul className='posts'>
      {this.props.posts.map(p => <li key={p.id}>
        <Post post={p} expanded={p.id === this.state.expanded} onExpand={this.expand}/>
      </li>)}
    </ul>
  }
}

export default PostList
