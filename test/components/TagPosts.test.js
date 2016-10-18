import { mocks } from '../support'
import { FETCH_TAG } from '../../src/actions'
import TagPosts from '../../src/containers/tag/TagPosts'
import { renderToString } from 'react-dom/server'
import cheerio from 'cheerio'
import { createElement } from '../support/helpers'

describe('TagPosts', () => {
  describe('with a 404 on FETCH_TAG', () => {
    var store, props

    beforeEach(() => {
      store = mocks.redux.store({
        errors: {
          [FETCH_TAG]: {
            meta: {tagName: 'intention'},
            payload: {
              response: {status: 404}
            }
          }
        }
      })

      props = {
        params: {tagName: 'intention', id: 'mycommunity'},
        location: {}
      }
    })

    it('shows an error message', () => {
      const component = createElement(TagPosts, props, {store})
      const doc = cheerio.load(renderToString(component))
      const message = doc('.access-error-message')
      expect(message.length).to.equal(1)
      expect(message.text()).to.equal('Page not found. Back')
    })
  })

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
      const component = createElement(TagPosts, props, {store})
      const doc = cheerio.load(renderToString(component))
      const message = doc('.loading')
      expect(message.length).to.equal(1)
      expect(message.text()).to.equal('Please wait...')
    })
  })
})
