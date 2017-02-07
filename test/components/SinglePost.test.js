import '../support'
import { fetchPost, fetchCommunity, unfollowPost } from '../../src/actions'
import { configureStore } from '../../src/store'
import { getPrefetchedData } from 'react-fetcher'
import { mockActionResponse } from '../support/helpers'

import { fetchToState } from  '../../src/containers/SinglePost/connector'

const bob = {id: '2', name: 'bob'}
const eva = {id: '5', name: 'eva'}
const post = {id: '1', name: 'foo', user_id: bob.id, follower_ids: [eva.id]}

describe('SinglePost connector', () => {
  describe('with action=unfollow query param', () => {
    it('unfollows the post', () => {
      let store = configureStore({
        people: {current: eva}
      }).store
      let params = {id: post.id}
      let query = {action: 'unfollow'}
      store.dispatch = spy(store.dispatch)
      mockActionResponse(fetchPost(post.id), {...post, people: [bob]})
      mockActionResponse(unfollowPost(post.id, eva.id), {})
      mockActionResponse(fetchCommunity('all'), {})
      return fetchToState({ store, params, query, dispatch: store.dispatch })
        .then(() => {
          const state = store.getState()
          expect(state.posts[post.id].follower_ids).to.be.empty
          const message = state.notifierMessages[0]
          expect(message).to.exist
          expect(message.type).to.equal('info')
          expect(message.text).to.equal('Notifications for this post are now off.')
        })
    })
  })
})
