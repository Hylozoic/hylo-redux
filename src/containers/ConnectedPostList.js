import React from 'react'
import { connect } from 'react-redux'
import PostList from '../components/PostList'
import { fetchPosts, checkFreshness } from '../actions/fetchPosts'
import { debug } from '../util/logging'
import { clearCache } from '../actions'
import { connectedListProps, fetchWithCache, createCacheId } from '../util/caching'
import { isEqual, pick, differenceBy, union } from 'lodash'
import { find, get } from 'lodash/fp'
const { array, bool, func, number, object, string } = React.PropTypes

export const fetch = fetchWithCache(fetchPosts)

const findExpandedPostId = state => {
  const modal = find(m => m.type === 'expanded-post', state.openModals)
  return get('params.id', modal)
}

@connect((state, props) => ({
  ...connectedListProps(state, props, 'posts'),
  expandedPostId: findExpandedPostId(state)
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
    expandedPostId: string,
    noPostsMessage: string,
    module: object
  }

  static contextTypes = {
    currentUser: object
  }

  loadMore = () => {
    let { posts, dispatch, total, pending, subject, id, query, omit } = this.props
    let offset = posts.length
    if (!pending && offset < total) {
      dispatch(fetch(subject, id, {...query, offset, omit}))
    }
  }

  checkForUpdates = currentPosts => {
    const { dispatch, subject, id, query, omit } = this.props

    this.visibility.visible() && dispatch(checkFreshness(
      subject,
      id,
      (currentPosts || this.props.posts).map(p => pick(p, ['id', 'updated_at'])),
      {limit: 5, offset: 0, omit, ...query}
    ))

    // every time we check for updates, whether it's due to the timeout
    // elapsing, the contents of the list changing, or the user returning to the
    // browser tab, we want to reset the timeout so that we don't check too
    // frequently. this is why we use setTimeout repeatedly instead of
    // setInterval.
    this.scheduleCheckForUpdates()
  }

  scheduleCheckForUpdates (currentPosts) {
    if (this.scheduledCheck) clearTimeout(this.scheduledCheck)
    this.scheduledCheck = setTimeout(this.checkForUpdates, 60000)
  }

  componentDidMount () {
    this.scheduleCheckForUpdates(this.props.posts)
    this.visibility = require('visibility')()
    this.visibility.on('show', this.checkForUpdates)
  }

  componentWillReceiveProps (nextProps) {
    if (differenceBy(nextProps.posts, this.props.posts, 'id').length !== 0) {
      this.scheduleCheckForUpdates(nextProps.posts)
    }
  }

  componentWillUnmount () {
    clearTimeout(this.scheduledCheck)
    this.visibility.removeListener('show', this.checkForUpdates)
  }

  shouldComponentUpdate (nextProps) {
    return !isEqual(this.props, nextProps)
  }

  render () {
    const {
      dispatch, freshCount, posts, total, pending, subject, id, query,
      hideMobileSearch, expandedPostId, noPostsMessage, module
    } = this.props

    const hide = union(this.props.hide, [expandedPostId])

    let refreshPostList
    if (freshCount !== 0) {
      refreshPostList = () => {
        dispatch(clearCache('postsByQuery', createCacheId(subject, id, query)))
        dispatch(fetch(subject, id, {...query}))
      }
    }

    const feedItems = posts

    if (module) {
      feedItems.splice(2, 0, module)
    }

    debug(`posts: ${posts ? posts.length : 0} / ${total || '??'}`)
    return <PostList posts={feedItems || []} loadMore={this.loadMore} hide={hide}
      hideMobileSearch={hideMobileSearch}
      {...{pending, refreshPostList, freshCount, noPostsMessage}} />
  }
}

export default ConnectedPostList
