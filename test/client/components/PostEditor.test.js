import '../support'
import { mocks } from '../../support'
import React, { PropTypes } from 'react'
import { mount } from 'enzyme'
import { cloneDeep, set } from 'lodash'
import * as postActions from '../../../src/actions/posts'
import RichTextEditor from '../../../src/components/RichTextEditor'
import { PostEditor } from '../../../src/components/PostEditor'

const currentUser = {id: 'person'}
const post = {id: 'foo'}
const parentPost = {id: 'parentFoo'}
const community = {
  id: 'f',
  slug: 'f',
  name: 'Foo Community'
}

const state = {
  pending: {},
  postEdits: {
    foo: {
      expanded: true,
      name: 'hello!',
      description: 'and welcome',
      community_ids: ['f']
    }
  },
  typeaheadMatches: {},
  communities: {
    f: community
  },
  currentCommunityId: 'f',
  tagsByCommunity: {}
}

let node, store

const render = (state, post, storeSetupCallback, otherProps = {}) => {
  store = mocks.redux.store(state)
  if (storeSetupCallback) storeSetupCallback(store)
  const context = {store, dispatch: store.dispatch, currentUser}
  const props = Object.assign({}, {post, community}, otherProps)
  node = mount(<PostEditor {...props} />, {
    context,
    childContextTypes: {
      dispatch: PropTypes.func,
      currentUser: PropTypes.object
    }
  })
}

describe('PostEditor', () => {
  beforeEach(() => {
    window.alert = spy(window.alert)
  })

  afterEach(() => {
    window.alert = window._originalAlert
  })

  describe('with a post', () => {
    beforeEach(() => {
      render(state, post)
    })

    it('renders', () => {
      expect(node.find('.post-editor')).to.have.prop('className', 'post-editor clearfix')
      expect(node.find('.title')).to.be.text('hello!')
      expect(node.find('.tag')).to.contain.text('Foo Community')
    })

    it('has a details field', () => {
      expect(node.find(RichTextEditor).length).to.equal(1)
    })

    it('displays tag description editor for creating new tag', () => {
      node.find('#tag-selector').simulate('click') //, {target: { value: ''}}
      node.find('.create a').simulate('click')
      expect(node.find('.tag-input').length).to.equal(1)
    })
  })

  describe('with an empty title', () => {
    beforeEach(() => {
      render(set(cloneDeep(state), 'postEdits.foo.name', ''), post)
    })

    it('fails validation', () => {
      node.find('.save').simulate('click')
      expect(window.alert).to.have.been.called.with('The title of a post cannot be blank.')
    })
  })

  describe('with no community selected', () => {
    beforeEach(() => {
      render(set(cloneDeep(state), 'postEdits.foo.community_ids', []), post)
    })

    it('fails validation', () => {
      node.find('.save').simulate('click')
      expect(window.alert).to.have.been.called.with('Please pick at least one community.')
    })
  })

  describe('with no post', () => {
    it('renders', () => {
      expect(() => {
        render(state, null)
      }).not.to.throw(Error)
    })
  })

  describe('with a parent post (project)', () => {
    beforeEach(() => {
      const newState = cloneDeep(state)
      set(newState, 'postEdits.', 'project')
      set(newState, 'postEdits.foo.tag', 'foo')
      render(newState, post, null, { parentPost })
    })

    it('should not have community selector', () => {
      expect(node.find('.communities').length).to.equal(0)
    })

    it('should not have a visibility selector', () => {
      expect(node.find('.visibility').length).to.equal(0)
    })

    // LEJ: For unknown reasons I haven't been able to mock the
    //      class methods nor post actions successfully in this context
    //
    // it('should not send community ids on save (set on the parent post only)', () => {
    //   postActions.updatePost = spy(postActions.updatePost)
    //   node.find('.save').simulate('click')
    //   expect(postActions.updatePost).to.have.been.called.once.with(post.id)
    //   // .with(post.id, {
    //   //   type: null,
    //   //   expanded: true,
    //   //   name: 'hello!',
    //   //   description: 'and welcome',
    //   //   community_ids: [ 'f' ],
    //   //   tag: 'foo',
    //   //   docs: [],
    //   //   removedDocs: [],
    //   //   parent_post_id: parentPost.id
    //   // }, 'f')
    // })
    //
    // it('should send the id of the parent post on save', () => {
    // })
  })
})

// 'should send id of the parent post on save'
// in #save: !params.include_key(:community_ids) #(dispatch((post ? updatePost : createPost)(id, params, currentCommunitySlug)))
// dispatch(updatePostEditor(data, id)) where data= {community_ids=...}
