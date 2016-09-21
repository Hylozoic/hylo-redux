require('../support')
import { mocks, helpers } from '../../support'
import { cloneDeep, set } from 'lodash'
import { PostEditor } from '../../../src/components/PostEditor'
import { FETCH_TAG } from '../../../src/actions'
import {
  findRenderedDOMComponentWithClass,
  renderIntoDocument,
  Simulate
} from 'react-addons-test-utils'
const { click } = Simulate
const { createElement, wait } = helpers

const currentUser = {id: 'person'}

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
    f: {
      id: 'f',
      name: 'Foo Community'
    }
  }
}

const post = {id: 'foo'}
let component, node, store

const render = (state, post, storeSetupCallback) => {
  store = mocks.redux.store(state)
  if (storeSetupCallback) storeSetupCallback(store)
  const context = {store, dispatch: store.dispatch, currentUser}
  component = createElement(PostEditor, {post}, context)
  node = renderIntoDocument(component).getWrappedInstance()
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
      let outerDiv = findRenderedDOMComponentWithClass(node, 'post-editor')
      expect(outerDiv.className).to.equal('post-editor clearfix')

      let title = findRenderedDOMComponentWithClass(node, 'title')
      expect(title.value).to.equal('hello!')

      let tag = findRenderedDOMComponentWithClass(node, 'tag')
      expect(tag.innerHTML).to.match(/Foo Community/)
    })

    it('has a details field', () => {
      // we just test a few important methods here -- tinymce won't load without
      // a proper browser environment
      node.refs.details.componentDidMount()
      node.goToDetails()
    })

    it('displays tag description editor for creating new tag', () => {
      click(node.refs.tagSelector)
      let createLink = findRenderedDOMComponentWithClass(node, 'create')
      click(createLink)
      findRenderedDOMComponentWithClass(node, 'tag-input')
    })
  })

  describe('with an empty title', () => {
    beforeEach(() => {
      render(set(cloneDeep(state), 'postEdits.foo.name', ''), post)
    })

    it('fails validation', () => {
      click(node.refs.save)
      expect(window.alert).to.have.been.called.with('The title of a post cannot be blank.')
    })
  })

  describe('with no community selected', () => {
    beforeEach(() => {
      render(set(cloneDeep(state), 'postEdits.foo.community_ids', []), post)
    })

    it('fails validation', () => {
      click(node.refs.save)
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

  describe('with a project post', () => {
    beforeEach(() => {
      const newState = cloneDeep(state)
      set(newState, 'postEdits.foo.type', 'project')
      set(newState, 'postEdits.foo.tag', 'foo')

      render(newState, post, store => {
        store.transformAction(FETCH_TAG, action => {
          return Promise.resolve({
            ...action,
            payload: {name: 'foo'}
          })
        })
      })
    })

    it('validates the tag', () => {
      click(node.refs.save)
      return wait(300, () => {
        expect(store.dispatch).to.have.been.called()
        const action = store.dispatched.slice(-1)[0]
        expect(action.type).to.equal(FETCH_TAG)
        expect(window.alert).to.have.been.called.with('The tag "foo" is already in use.')
      })
    })
  })
})
