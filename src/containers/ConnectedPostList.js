import React from 'react'
import { connect } from 'react-redux'
import PostList from '../components/PostList'
import { fetchPosts, checkFreshness } from '../actions/fetchPosts'
import { debug } from '../util/logging'
import { clearCache } from '../actions'
import { connectedListProps, fetchWithCache, createCacheId } from '../util/caching'
import { intersection, isEqual, isNull, keys, omitBy, pick } from 'lodash'
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
    newPosts: bool,
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
    let { dispatch, subject, id, query, posts } = this.props
    this.intervalId = setInterval(() =>
      dispatch(checkFreshness(
        subject,
        id,
        posts.map(p => pick(p, ['id', 'updated_at'])),
        {limit: 6, ...query}
      )),
      15 * 1000)
  }

  componentWillUnmount () {
    clearInterval(this.intervalId)
  }

  shouldComponentUpdate (nextProps) {
    return !isEqual(this.props, nextProps)
  }

  render () {
    let { dispatch, newPosts, posts, total, pending, editingPostIds, subject, id, query } = this.props

    let refreshPostList
    if (newPosts) {
      refreshPostList = () => {
        dispatch(clearCache('postsByCommunity', createCacheId(subject, id, query)))
        dispatch(fetch(subject, id, {...query}))
      }
    }

    if (!posts) posts = []
    debug(`posts: ${posts.length} / ${total || '??'}`)
    return <PostList {...{posts, editingPostIds, pending, refreshPostList}} loadMore={this.loadMore}/>
  }
}

export default ConnectedPostList
