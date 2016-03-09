import React from 'react'
import { connect } from 'react-redux'
import PostList from '../components/PostList'
import { fetchPosts, checkFreshness } from '../actions/fetchPosts'
import { debug } from '../util/logging'
import { clearCache } from '../actions'
import { connectedListProps, fetchWithCache, createCacheId } from '../util/caching'
import { intersection, isEqual, isNull, keys, omitBy, pick, differenceBy } from 'lodash'
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
    stale: bool,
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

  setCheckFreshnessInterval (cachedPosts) {
    let { dispatch, subject, id, query } = this.props
    var dispatchCheckFreshness = () => dispatch(checkFreshness(
      subject,
      id,
      cachedPosts.map(p => pick(p, ['id', 'updated_at'])),
      {limit: 5, offset: 0, ...query}
    ))

    if (this.intervalId) {
      clearInterval(this.intervalId)
    }

    this.intervalId = setInterval(dispatchCheckFreshness, 60 * 1000)
  }

  componentDidMount () {
    this.setCheckFreshnessInterval(this.props.posts)
  }

  componentWillReceiveProps (nextProps) {
    if (differenceBy(nextProps.posts, this.props.posts, 'id').length !== 0) {
      this.setCheckFreshnessInterval(nextProps.posts)
    }
  }

  componentWillUnmount () {
    clearInterval(this.intervalId)
  }

  shouldComponentUpdate (nextProps) {
    return !isEqual(this.props, nextProps)
  }

  render () {
    let { dispatch, stale, posts, total, pending, editingPostIds, subject, id, query } = this.props

    let refreshPostList
    if (stale) {
      refreshPostList = () => {
        dispatch(clearCache('postsByQuery', createCacheId(subject, id, query)))
        dispatch(fetch(subject, id, {...query}))
      }
    }

    if (!posts) posts = []
    debug(`posts: ${posts.length} / ${total || '??'}`)
    return <PostList {...{posts, editingPostIds, pending, refreshPostList}} loadMore={this.loadMore}/>
  }
}

export default ConnectedPostList
