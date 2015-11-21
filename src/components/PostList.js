import { throttle } from 'lodash'
import { isAtBottom } from '../util/scrolling'
import React from 'react'
import Post from './Post'

const { array, func } = React.PropTypes

class PostList extends React.Component {
  static propTypes = {
    posts: array,
    loadMore: func
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
    return <ul className='posts'>
      {this.props.posts.map(p => <li key={p.id}>
        <Post post={p} expanded={p.id === this.state.expanded} onExpand={this.expand}/>
      </li>)}
    </ul>
  }
}

export default PostList
