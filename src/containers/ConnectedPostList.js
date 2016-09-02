import React from 'react'
import { connect } from 'react-redux'
import PostList from '../components/PostList'
import { fetchPosts, checkFreshness } from '../actions/fetchPosts'
import { debug } from '../util/logging'
import { clearCache } from '../actions'
import { connectedListProps, fetchWithCache, createCacheId } from '../util/caching'
import { isEqual, pick, differenceBy, union } from 'lodash'
import { get } from 'lodash/fp'
const { array, bool, func, number, object, string } = React.PropTypes

export const fetch = fetchWithCache(fetchPosts)

@connect((state, props) => ({
  ...connectedListProps(state, props, 'posts'),
  expandedPostId: get('params.id', state.showModal)
}), null, null, {withRef: true})
export class ConnectedPostList extends React.Component {
  static propTypes = {
    subject: string.isRequired,
    id: string.isRequired,
    posts: array,
    freshCount: number,
    dispatch: func,
    total: number,
    pending: bool,
    query: object,
    omit: string, // omit posts with this id from the query
    hide: array, // just hide posts with this id from the results
    hideMobileSearch: bool,
    expandedPostId: string
  }

  loadMore = () => {
    let { posts, dispatch, total, pending, subject, id, query, omit } = this.props
    let offset = posts.length
    if (!pending && offset < total) {
      dispatch(fetch(subject, id, {...query, offset, omit}))
    }
  }

  setCheckFreshnessInterval (cachedPosts) {
    let { dispatch, subject, id, query, omit } = this.props
    var dispatchCheckFreshness = () => dispatch(checkFreshness(
      subject,
      id,
      cachedPosts.map(p => pick(p, ['id', 'updated_at'])),
      {limit: 5, offset: 0, omit, ...query}
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
    const {
      dispatch, freshCount, posts, total, pending, subject, id, query,
      hideMobileSearch, expandedPostId
    } = this.props

    const hide = union(this.props.hide, [expandedPostId])

    let refreshPostList
    if (freshCount !== 0) {
      refreshPostList = () => {
        dispatch(clearCache('postsByQuery', createCacheId(subject, id, query)))
        dispatch(fetch(subject, id, {...query}))
      }
    }

    debug(`posts: ${posts ? posts.length : 0} / ${total || '??'}`)
    return <PostList posts={posts || []} {...{pending, refreshPostList, freshCount}}
      loadMore={this.loadMore} hide={hide} hideMobileSearch={hideMobileSearch}/>
  }
}

export default ConnectedPostList
