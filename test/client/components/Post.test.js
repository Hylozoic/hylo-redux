import '../support'
import { merge } from 'lodash'
import { mocks } from '../../support'
import { createElement } from '../../support/helpers'
import {
  findRenderedDOMComponentWithClass,
  renderIntoDocument
} from 'react-addons-test-utils'
import React from 'react'
import { mount, shallow } from 'enzyme'
import { configureStore } from '../../../src/store'
import ConnectedPost from '../../../src/components/Post'
import Post from '../../../src/components/Post/component'

const { object, func } = React.PropTypes

const requiredProps = {
  post: {
    tag: '',
    communities: [
      {slug: 'testcommunity'}
    ]
  },
  actions: {
    voteOnPost: () => {}
  },
  comments: []
}

const defaultContext = {
  currentUser: {}
}

function renderComponent (props) {
  return shallow(<Post {...merge(requiredProps, props)} />, {context: defaultContext})
}

describe('Post', () => {
  it('will render with minimum required props', () => {
    const wrapper = renderComponent()
    expect(wrapper.find('.post').length).to.equal(1)
  })

  it('presents the image on a post', () => {
    const props = {post: {media: [{type: 'image', url: 'imageurl'}]}}
    const wrapper = renderComponent(props)
    expect(wrapper.find('img').length).to.equal(1)
    expect(wrapper.find('img').prop('src')).to.equal('imageurl')
  })

  it('styles a post with an image', () => {
    const props = {post: {media: [{type: 'image', url: 'imageurl'}]}}
    const wrapper = renderComponent(props)
    expect(wrapper.find('.image').length).to.equal(1)
  })

  it('styles an expanded post', () => {
    const props = {expanded: true}
    const wrapper = renderComponent(props)
    expect(wrapper.find('.expanded').length).to.equal(1)
  })

  it('styles a unexpanded post', () => {
    const props = {expanded: false}
    const wrapper = renderComponent(props)
    expect(wrapper.find('.expanded').length).to.equal(0)
  })

  describe('with a parentPost', () => {
    const props = {
      post: {communities: {foo: {}, bar: {}}},
      parentPost: {communities: {goo: {}, car: {}}}
    }

    it('inherits communities from the parent', () => {
      const wrapper = renderComponent(props)
      expect(wrapper.find('Connect(PostHeader)').prop('communities'))
      .to.deep.equal(props.parentPost.communities)
    })

    it('inherits passes the prop to the header', () => {
      const wrapper = renderComponent(props)
      expect(wrapper.find('Connect(PostHeader)').prop('parentPost'))
      .to.deep.equal(props.parentPost)
    })
  })

  it('uses community in post', () => {
    const wrapper = renderComponent()
    expect(wrapper.find('Details').prop('community'))
    .to.deep.equal(requiredProps.post.communities[0])
  })

  describe('with comments', () => {
    it('comments are passed as a prop for comments component', () => {
      const props = {
        comments: [
          {id: '1', text: 'yes!', user: {id: '6', name: 'jo klunk'}},
          {id: '2', text: 'yes!', user: {id: '6', name: 'jo klunk'}}
        ]
      }
      const wrapper = renderComponent(props)
      expect(wrapper.find('CommentSection').prop('comments'))
      .to.deep.equal(props.comments)
    })
  })

  describe('(legacy tests)', () => {
    it('renders expanded', () => {
      const props = {post, expanded: true}
      const store = mocks.redux.store(state)
      const context = {store, dispatch: store.dispatch}
      let component = createElement(ConnectedPost, props, context)
      let node = renderIntoDocument(component)
      findRenderedDOMComponentWithClass(node, 'post')
      let details = findRenderedDOMComponentWithClass(node, 'details')
      let expected = new RegExp(`<span[^>]*><p>${post.description}&nbsp;<\/p><\/span><a class="hashtag" [^>]*>#offer<\/a>`) // eslint-disable-line
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
      let component = createElement(ConnectedPost, props, context)
      let node = renderIntoDocument(component)
      findRenderedDOMComponentWithClass(node, 'post')
      let details = findRenderedDOMComponentWithClass(node, 'details')
      let expected = new RegExp(`<span[^>]*><p>${post.description}&nbsp;<\/p><\/span><a class="hashtag" [^>]*>#offer<\/a>`) // eslint-disable-line
      expect(details.innerHTML).to.match(expected)
      let title = findRenderedDOMComponentWithClass(node, 'title')
      expect(title.innerHTML).to.equal('i have "something" for you!')
    })

    it('visualizes cross posting between communities', () => {
      const props = {post: post2}
      const store = mocks.redux.store(state)
      const context = {store, dispatch: store.dispatch}
      let component = createElement(ConnectedPost, props, context)
      let node = renderIntoDocument(component)
      let communities = findRenderedDOMComponentWithClass(node, 'communities')
      let expected = '&nbsp;in&nbsp;<a>Foomunity</a><span> + </span><div class="dropdown post-communities-dropdown" tabindex="99"><a class="dropdown-toggle"><span>3 others</span></a><ul class="dropdown-menu"></ul><span></span></div>'
      expect(stripComments(communities.innerHTML)).to.equal(expected)
    })

    it('opens PostEditorModal on edit when expanded', () => {
      const store = configureStore(state).store
      const node = mount(<ConnectedPost expanded post={post} />, {
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
})

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

const contributor = {
  id: 'a',
  name: 'Adam'
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
    [post2.id]: post2
  },
  typeaheadMatches: {
    contributors: [contributor]
  },
  commentEdits: {
    new: {},
    edit: {}
  },
  pending: {}
}
