import support from '../support' // eslint-disable-line no-unused-vars
import React from 'react'
import App from '../../../src/containers/App'
import TagPosts from '../../../src/containers/tag/TagPosts'
import { newPostId } from '../../../src/components/PostEditor'
import { FETCH_TAG } from '../../../src/constants'
import { createPost, fetchPosts, updatePostEditor, fetchTag } from '../../../src/actions'
import { configureStore } from '../../../src/store'
import { mount } from 'enzyme'
import { mockActionResponse, wait } from '../../support/helpers'

const community = {id: '2', name: 'my community', slug: 'mycom'}
const currentUser = {id: 1}

const post = {
  id: '3',
  name: 'hello world',
  community_ids: [community.id],
  tag: 'foo',
  user_id: currentUser.id
}

const createAction = createPost(newPostId, {
  tag: 'foo', community_ids: [community.id]
})

const mockRejectCreatePostWithoutTagDescription = () =>
  mockActionResponse(createAction, {
    tagsMissingDescriptions: {foo: [community.id]}
  }, 422)

const mockCreatePostSuccess = () =>
  mockActionResponse(createAction, {post})

const mockFetchTag = () =>
  mockActionResponse(fetchTag('foo', community.slug), {
    id: '7',
    name: 'foo',
    community_id: community.id,
    owner: currentUser,
    created: true,
    followed: true,
    followers: [currentUser],
    description: 'tag description'
  })

const mockFetchPosts = () =>
  mockActionResponse(fetchPosts({
    subject: 'community',
    id: community.slug,
    tag: 'foo',
    limit: 10
  }), {
    posts: [post]
  })

describe('TagPosts', () => {
  var store, nock1, nock2, nock3, nock4

  beforeEach(() => {
    store = configureStore({
      communities: {[community.id]: community},
      errors: {
        [FETCH_TAG]: {
          payload: {response: {status: 404}},
          meta: {tagName: 'foo'}
        }
      },
      people: {
        current: currentUser,
        [currentUser.id]: currentUser
      }
    }).store
  })

  it('reloads the tag after a post is created', function () {
    const props = {
      params: {tagName: 'foo', id: community.slug},
      location: {}
    }

    // wrap TagPosts in App so we can render TagEditorModal
    const node = mount(<App><TagPosts {...props}/></App>, {
      context: {store, currentUser},
      childContextTypes: {currentUser: React.PropTypes.object}
    })

    expect(node.find('.unused-message').text())
    .to.equal('No one has used this topic yet.')

    node.find('.post-editor .prompt').simulate('click')

    // set the minimum editor fields needed to pass validation
    store.dispatch(updatePostEditor({
      name: 'hello world',
      community_ids: [community.id]
    }, newPostId))

    nock1 = mockRejectCreatePostWithoutTagDescription()

    return Promise.resolve(node.find('.buttons .save').simulate('click'))
    .then(() => wait(500))
    .then(() => {
      expect(nock1.isDone()).to.be.true

      node.find('#tag-description-editor textarea').simulate('change', {
        target: {value: 'tag description'}
      })

      nock2 = mockCreatePostSuccess()
      nock3 = mockFetchTag()
      nock4 = mockFetchPosts()

      return node.find('#tag-description-editor .ok').simulate('click')
    })
    .then(() => wait(500))
    .then(() => {
      expect(nock2.isDone()).to.be.true
      expect(nock3.isDone()).to.be.true
      expect(nock4.isDone()).to.be.true

      expect(node.find('.unused-message').length).to.equal(0)
      expect(node.find('.posts .post').length).to.equal(1)
    })
  })
})
