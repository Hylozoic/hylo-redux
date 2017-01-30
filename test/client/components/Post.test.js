import '../support'
import { mocks } from '../../support'
import { mockActionResponse, createElement, wait } from '../../support/helpers'
import {
  findRenderedDOMComponentWithClass,
  renderIntoDocument
} from 'react-addons-test-utils'
import React from 'react'
import { mount } from 'enzyme'
import { connect } from 'react-redux'
import { configureStore } from '../../../src/store'
import * as typeaheadActions from '../../../src/actions/typeahead'
import * as postActions from '../../../src/actions/posts'
import Post from '../../../src/components/Post'

const { object, func } = React.PropTypes

const stripComments = markup => markup.replace(/<!--[^>]*-->/g, '')

const post = {
  id: 'p',
  name: 'i have &quot;something&quot; for you!',
  description: 'it is very special.',
  type: 'offer',
  tag: 'offer',
  created_at: new Date(),
  updated_at: new Date(),
  user_id: 'x',
  community_ids: ['1'],
  follower_ids: ['x', 'y']
}

const contributor = {
  id: 'a',
  name: 'Adam'
}

const post2 = {
  id: '2',
  name: 'This post is in four different communities!',
  description: "It's just that relevant",
  type: 'offer',
  tag: 'offer',
  created_at: new Date(),
  updated_at: new Date(),
  user_id: 'x',
  community_ids: ['1', '2', '3', '4']
}

const requestPost = {
  id: 'requestPost',
  name: 'Please help me.',
  description: 'This is a request for help',
  type: 'request',
  tag: 'request',
  created_at: new Date(),
  updated_at: new Date(),
  user_id: 'x',
  community_ids: ['1', '2'],
  follower_ids: ['x', 'y']
}

const state = {
  currentCommunityId: '1',
  communities: {
    foo: {id: '1', name: 'Foomunity', slug: 'foo'},
    bar: {id: '2', name: 'Barmunity', slug: 'bar'},
    baz: {id: '3', name: 'Bazmunity', slug: 'baz'},
    qux: {id: '4', name: 'Quxmunity', slug: 'qux'}
  },
  people: {
    current: {
      id: 'x',
      name: 'Mr. X',
      avatar_url: '/img/mrx.png'
    },
    x: {
      id: 'x',
      name: 'Mr. X',
      avatar_url: '/img/mrx.png'
    }
  },
  posts: {
    [post.id]: post,
    [post2.id]: post2,
    [requestPost.id]: requestPost
  },
  typeaheadMatches: {
    contributors: [contributor]
  }
}

describe('Post', () => {
  it('renders expanded', () => {
    const props = {post, expanded: true}
    const store = mocks.redux.store(state)
    const context = {store, dispatch: store.dispatch}
    let component = createElement(Post, props, context)
    let node = renderIntoDocument(component)
    findRenderedDOMComponentWithClass(node, 'post')
    let details = findRenderedDOMComponentWithClass(node, 'details')
    let expected = new RegExp(`<span[^>]*><p>${post.description}&nbsp;<\/p><\/span><a class="hashtag" [^>]*>#offer<\/a>`)
    expect(details.innerHTML).to.match(expected)
    let title = findRenderedDOMComponentWithClass(node, 'title')
    expect(title.innerHTML).to.equal('i have "something" for you!')
  })

  it('renders for a logged-out visitor', () => {
    const props = {post, expanded: true}
    const store = mocks.redux.store({
      ...state,
      people: {
        ...state.people,
        current: null
      }
    })
    const context = {store, dispatch: store.dispatch}
    let component = createElement(Post, props, context)
    let node = renderIntoDocument(component)
    findRenderedDOMComponentWithClass(node, 'post')
    let details = findRenderedDOMComponentWithClass(node, 'details')
    let expected = new RegExp(`<span[^>]*><p>${post.description}&nbsp;<\/p><\/span><a class="hashtag" [^>]*>#offer<\/a>`)
    expect(details.innerHTML).to.match(expected)
    let title = findRenderedDOMComponentWithClass(node, 'title')
    expect(title.innerHTML).to.equal('i have "something" for you!')
  })

  it('visualizes cross posting between communities', () => {
    const props = {post: post2}
    const store = mocks.redux.store(state)
    const context = {store, dispatch: store.dispatch}
    let component = createElement(Post, props, context)
    let node = renderIntoDocument(component)
    let communities = findRenderedDOMComponentWithClass(node, 'communities')
    let expected = '&nbsp;in&nbsp;<a>Foomunity</a><span> + </span><div class="dropdown post-communities-dropdown" tabindex="99"><a class="dropdown-toggle"><span>3 others</span></a><ul class="dropdown-menu"></ul><span></span></div>'
    expect(stripComments(communities.innerHTML)).to.equal(expected)
  })

  it('opens PostEditorModal on edit when expanded', () => {
    const store = configureStore(state).store
    const node = mount(<Post expanded post={post} />, {
      context: {store, dispatch: store.dispatch, currentUser: state.people.current},
      childContextTypes: {store: object, dispatch: func, currentUser: object}
    })
    node.find('.dropdown-toggle').first().simulate('click')
    node.find('.post-menu .edit').first().simulate('click')
    const updatedState = store.getState()
    expect(updatedState.openModals[0].type).to.equal('post-editor')
    expect(updatedState.openModals[0].params.post).to.contain({
      name: post.name, description: post.description
    })
    expect(updatedState.postEdits[post.id]).to.contain({
      name: post.name, description: post.description
    })
  })

  describe('#request type', () => {
    let node

    beforeEach(() => {
      window.FEATURE_FLAGS = { CONTRIBUTORS: 'on' }
      const store = configureStore(state).store
      const PostWrapper = connect(({ posts }, { id }) => ({
        post: posts[id]
      }))(({ post }) => {
        return <Post post={post} />
      })
      node = mount(<PostWrapper id={requestPost.id} dispatch={store.dispatch} />, {
        context: { store, dispatch: store.dispatch, currentUser: state.people.current },
        childContextTypes: {store: object, dispatch: func, currentUser: object}
      })
      mockActionResponse(postActions.completePost(requestPost.id), {})
      mockActionResponse(typeaheadActions.typeahead(contributor.name), {})
    })

    it('can be completed (with contributors)', () => {
      expect(node.find('.toggle')).to.be.length(1)
      node.find('.toggle').simulate('change')
      expect(node.find('.request-complete-heading').text()).to.contain('Awesome')
      expect(node.find('.request-complete-people-input')).to.be.length(1)
      node.find('.request-complete-people-input a').simulate('click')
      expect(node.find('.request-complete-people-input li.tag').text())
      .to.contain(contributor.name)
      expect(node.find('.done')).to.be.length(1)
      postActions.completePost = spy(postActions.completePost)
      node.find('.done').simulate('click')
      expect(postActions.completePost).to.have.been.called.once.with([contributor])
      expect(node.find('.contributors .person')).to.be.length(1)
      expect(node.find('.contributors').text()).to.contain(contributor.name)
    })

    it('can be completed (without contributors)', () => {
      expect(node.find('.toggle')).to.be.length(1)
      node.find('.toggle').simulate('change')
      expect(node.find('.done')).to.be.length(1)
      postActions.completePost = spy(postActions.completePost)
      node.find('.done').simulate('click')
      expect(postActions.completePost).to.have.been.called.once.with(requestPost.id, [])
      expect(node.find('.contributors .person')).to.be.length(0)
    })

    it('can be uncompleted', () => {
      expect(node.find('.toggle')).to.be.length(1)
      node.find('.toggle').simulate('change')
      expect(node.find('.done')).to.be.length(1)
      postActions.completePost = spy(postActions.completePost)
      node.find('.done').simulate('click')
      expect(postActions.completePost).to.have.been.called.once.with(requestPost.id, [])
      expect(node.find('.contributors .person')).to.be.length(0)
      expect(node.find('.contributors').text()).to.contain('completed')
      expect(node.find('.toggle')).to.be.length(1)
      postActions.completePost = spy(postActions.completePost)
      window.confirm = spy(() => true)
      node.find('.toggle').simulate('change')
      expect(window.confirm).to.have.been.called.once()
      expect(postActions.completePost).to.have.been.called.once.with(requestPost.id)
      expect(node.find('.request-complete-heading').text())
      .to.contain('if this request has been completed')
    })

    it('requests contributors from all communities associated with a post', () => {
      node.find('.toggle').simulate('change')
      typeaheadActions.typeahead = spy(typeaheadActions.typeahead)
      node.find('.request-complete-people-input input').simulate('change', {
        target: {value: contributor.name}, keyCode: 13
      })
      return wait(300, () =>
        expect(typeaheadActions.typeahead).to.have.been.called.with(
          {type: 'people', communityIds: requestPost.community_ids}))
    })
  })
})
