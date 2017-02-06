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
    tag: ''
  },
  actions: {
    voteOnPost: () => {}
  },
  comments: []
}

const defaultContext = {
  currentUser: {}
}

describe('Post', () => {
  it('will render with minimum required props', () => {
    const wrapper = shallow(<Post {...requiredProps} />)
    expect(wrapper.find('.post').length).to.equal(1)
  })

  describe('post', () => {
  })

  describe('child post', () => {
  })

  describe('with image', () => {
  })

  describe('prop: expanded', () => {
    it('expanded', () => {
      const wrapper = shallow(<Post {...requiredProps} />)
      expect(wrapper.find('.expanded').length).to.equal(0)
    })

    it('not expanded', () => {
      const wrapper = shallow(<Post expanded {...requiredProps} />)
      expect(wrapper.find('.expanded').length).to.equal(1)
    })
  })

  describe('prop: parentPost', () => {
    const props = {
      post: { communities: { foo: {}, bar: {} } },
      parentPost: { communities: { goo: {}, car: {} } }
    }

    it('inherits communities from parent', () => {
      const wrapper = shallow(<Post {...merge(requiredProps, props)} />)
      expect(wrapper.find('Connect(PostHeader)').prop('communities'))
      .to.deep.equal(props.parentPost.communities)
    })
  })

  describe('prop: community', () => {
    const props = {
      community: {slug: ''}
    }

    it('is set as prop for details component', () => {
      const wrapper = shallow(<Post {...merge(requiredProps, props)} />)
      expect(wrapper.find('Details').prop('community'))
      .to.deep.equal(props.community)
    })
  })

  describe('prop: comments', () => {
    const props = {
      comments: [
        {id: '1', text: 'yes!', user: {id: '6', name: 'jo klunk'}},
        {id: '2', text: 'yes!', user: {id: '6', name: 'jo klunk'}}
      ]
    }

    it('is set as prop for comments component', () => {
      const wrapper = shallow(<Post {...merge(requiredProps, props)} />)
      expect(wrapper.find('CommentSection').prop('comments'))
      .to.deep.equal(props.comments)
    })
  })
    // const props = {post, expanded: true}
    // const store = mocks.redux.store(state)
    // const context = {store, dispatch: store.dispatch}
    // let component = createElement(ConnectedPost, props, context)
    // let node = renderIntoDocument(component)
    // findRenderedDOMComponentWithClass(node, 'post')
    // let details = findRenderedDOMComponentWithClass(node, 'details')
    // let expected = new RegExp(
    //   `<span[^>]*><p>${post.description}&nbsp;<\/p><\/span><a class="hashtag" [^>]*>#offer<\/a>` // eslint-disable-line
    // )
    // expect(details.innerHTML).to.match(expected)
    // let title = findRenderedDOMComponentWithClass(node, 'title')
    // expect(title.innerHTML).to.equal('i have "something" for you!')
  // })

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
    let expected = new RegExp(
      `<span[^>]*><p>${post.description}&nbsp;<\/p><\/span><a class="hashtag" [^>]*>#offer<\/a>` // eslint-disable-line
    )
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

const normalizedParentPost = {
  id: 'parentPost',
  name: 'Project otherwise known as a parentPost',
  description: 'it is very special.',
  type: 'project',
  tag: 'project',
  created_at: new Date(),
  updated_at: new Date(),
  user: state.people.x,
  communities: [state.communities.foo],
  parent_post_id: null,
  project: {}
}

const normalizedChildPost = {
  id: 'childPost',
  parent_post_id: 'parentPost',
  name: 'I am a project posting, but not a special request',
  description: 'it is very special.',
  created_at: new Date(),
  updated_at: new Date(),
  user: state.people.x,
  communities: [state.communities.foo],
  project: {}
}
