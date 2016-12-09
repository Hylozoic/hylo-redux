require('../support')
import { mocks } from '../../support'
import { createElement } from '../../support/helpers'
import React from 'react'
import { mount } from 'enzyme'
import { configureStore } from '../../../src/store'
import Post from '../../../src/components/Post'
import {
  findRenderedDOMComponentWithClass,
  renderIntoDocument
} from 'react-addons-test-utils'
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

const state = {
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
  typeaheadMatches: {
    invite: [
      {id: 'a', name: 'Adam'},
      {id: 'b', name: 'Suzy'}
    ]
  }
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
    let expected = '&nbsp;in <a>Foomunity</a><span> + </span><div class="dropdown post-communities-dropdown" tabindex="99"><a class="dropdown-toggle"><span>3 others</span></a><ul class="dropdown-menu"></ul><span></span></div>'
    expect(stripComments(communities.innerHTML)).to.equal(expected)
  })

  it('opens PostEditorModal on edit when expanded', () => {
    const store = configureStore(state).store
    const node = mount(<Post expanded post={post}/>, {
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
})


describe('Post #request type', () => {
  before(() => {
    window.FEATURE_FLAGS = { CONTRIBUTORS: 'on' }
  })

  after(() => {
    delete window.FEATURE_FLAGS
  })

  const requestPost = {
    id: 'p',
    name: 'Please help me.',
    description: 'This is a request for help',
    type: 'request',
    tag: 'request',
    created_at: new Date(),
    updated_at: new Date(),
    user_id: 'x',
    community_ids: ['1'],
    follower_ids: ['x', 'y']
  }

  it('can be completed with contributors', () => {
    const store = configureStore(state).store
    const node = mount(
      <Post expanded post={requestPost} />, {
      context: {
        store,
        dispatch: store.dispatch,
        currentUser: state.people.current
      },
      childContextTypes: {
        store: object,
        dispatch: func,
        currentUser: object,
      }
    })
    expect(node.find('.request-complete-message').text()).to.contain('Click the checkmark')
    node.find('.toggle').simulate('change')
    expect(node.find('.request-complete-message').text()).to.contain('Awesome')
    expect(node.find('.request-complete-people-input input').length).to.equal(1)
    node.find('.request-complete-people-input a').first().simulate('click')
    node.find('.done').simulate('click')
    console.log(node.find('.request-complete-people-input ul li').first().html())

    // let searchInput = node.find('.request-complete-people-input input')
        // expect(searchInput.length).to.equal(2)
    // searchInput.node.value = 'Su'
    // searchInput.simulate('change')
    // console.log(searchInput.node.value)
    // console.log(node.find('.request-complete-people-input .dropdown-menu a').at(0).html())

    // node.find('.request-complete-people-input input').simulate('change', node.find('.request-complete-people-input input'))
    // //
    // node.find('.request-complete-people-input input').simulate('change', target: { value: 'Ad' })
    //
    //
    // expect(node.find('.request-complete-people-input a').length).to.equal(100)
    //
    // node.find('.request-complete-people-input a').simulate('click')
    //

    // 'Click the checkmark if your request has been completed!'




    // console.log("!!!", node.find('.request-complete-people-input .dropdown-menu ul li a').first())

    // node.find('.emails textarea').first().simulate('change', {
    //   target: {value: 'nogood, bademail'}
    // })
    // const updatedState = store.getState()
    // expect(updatedState.openModals[0].type).to.equal('post-editor')
    // expect(updatedState.openModals[0].params.post).to.contain({
    //   name: post.name, description: post.description
    // })
    // expect(updatedState.postEdits[post.id]).to.contain({
    //   name: post.name, description: post.description
    // })
  })
  // it('allows a request type post to be completed')
  //   (ref enzyme mount method in * see in final test here)
  //   instantiate Post component with #request type
  //   click on complete checkbox
  //   select contributors
})
