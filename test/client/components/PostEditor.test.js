require('../support')
import { mocks, helpers } from '../../support'
import { set } from 'lodash'
import { PostEditor } from '../../../src/components/PostEditor'
import {
  findRenderedDOMComponentWithClass,
  renderIntoDocument,
  Simulate
} from 'react-addons-test-utils'

const state = {
  people: {
    current: {
      id: 'person'
    }
  },
  pending: {},
  postEdits: {
    foo: {
      expanded: true,
      name: 'hello!',
      description: 'and welcome',
      communities: ['f']
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

const render = (state, post) => {
  store = mocks.redux.store(state)
  component = helpers.createElement(PostEditor, {post}, {store})
  node = renderIntoDocument(component).getWrappedInstance()
}

describe('PostEditor', () => {
  describe('with a post', () => {
    before(() => {
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
  })

  describe('with an empty title', () => {
    before(() => {
      window.alert = spy(window.alert)
      render(set(state, 'postEdits.foo.name', ''), post)
    })

    after(() => {
      window.alert = window._originalAlert
    })

    it('fails validation', () => {
      Simulate.click(node.refs.save)
      expect(window.alert).to.have.been.called.with('The title of a post cannot be blank.')
    })
  })

  describe('with no post', () => {
    it('renders', () => {
      expect(() => {
        render(state, {})
      }).not.to.throw(Error)
    })
  })
})
