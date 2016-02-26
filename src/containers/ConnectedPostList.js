import React from 'react'
import { connect } from 'react-redux'
import PostList from '../components/PostList'
import { fetchPosts } from '../actions/fetchPosts'
import { debug } from '../util/logging'
import { connectedListProps, fetchWithCache } from '../util/caching'
import { intersection, isEqual, isNull, keys, omitBy } from 'lodash'
const { array, bool, func, number, object, string } = React.PropTypes

export const fetch = fetchWithCache(fetchPosts)

@connect((state, props) => {
  let listProps = connectedListProps(state, props, 'posts')
  let editingPostIds = intersection(
    keys(omitBy(state.postEdits, isNull)),
    listProps.posts.map(p => p.id)
  )

  return {...listProps, editingPostIds}
})
export class ConnectedPostList extends React.Component {
  static propTypes = {
    subject: string.isRequired,
    id: string.isRequired,
    posts: array,
    stagedPosts: array,
    dispatch: func,
    total: number,
    pending: bool,
    query: object,
    editingPostIds: array
  }

  loadMore = () => {
    let { posts, dispatch, total, pending, subject, id, query } = this.props
    let offset = posts.length
    if (!pending && offset < total) {
      dispatch(fetch(subject, id, {...query, offset}))
    }
  }

  componentDidMount () {
    let { dispatch, subject, id, query } = this.props
    setInterval(() => dispatch(fetch(subject, id, {staged: true, ...query})),
      15 * 1000)
  }

  shouldComponentUpdate (nextProps) {
    return !isEqual(this.props, nextProps)
  }

  render () {
    let { posts, stagedPosts, total, pending, editingPostIds } = this.props

    let newPosts

    if (stagedPosts.length > 0) {
      newPosts = () => console.log('New Posts', stagedPosts)
    }

    if (!posts) posts = []
    debug(`posts: ${posts.length} / ${total || '??'}`)
    return <PostList {...{posts, editingPostIds, pending, newPosts}} loadMore={this.loadMore}/>
  }
}

export default ConnectedPostList
