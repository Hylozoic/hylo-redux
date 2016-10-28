import { mocks } from '../support'
import TagPosts from '../../src/containers/tag/TagPosts'
import { render } from 'enzyme'
import React from 'react'
import { Provider } from 'react-redux'

describe('TagPosts', () => {
  describe('when the tag is loading', () => {
    var props, store

    beforeEach(() => {
      props = {
        params: {tagName: 'intention', id: 'mycommunity'},
        location: {}
      }

      store = mocks.redux.store()
    })

    it('shows a loading message', () => {
      const node = render(<Provider store={store}>
        <TagPosts {...props}/>
      </Provider>)
      expect(node.find('.loading').length).to.equal(1)
      expect(node.find('.loading').text()).to.equal('Please wait...')
    })
  })
})
