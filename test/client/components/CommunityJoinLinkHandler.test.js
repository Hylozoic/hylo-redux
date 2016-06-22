require('../support')
import { mocks, helpers } from '../../support'
import CommunityJoinLinkHandler from '../../../src/containers/community/CommunityJoinLinkHandler.js'
import { renderIntoDocument } from 'react-addons-test-utils'
import { NAVIGATE } from '../../../src/actions'
const { createElement } = helpers

describe.only('CommunityJoinLinkHandler', () => {
  var store, redirectUrl

  const renderAndWait = (props, callback) => {
    const component = createElement(CommunityJoinLinkHandler, props, {store})
    renderIntoDocument(component).getWrappedInstance()
    setTimeout(callback, 10)
  }

  beforeEach(() => {
    store = mocks.redux.store({
      people: {current: {id: 42}},
      errors: {}
    })
    store.transformAction(NAVIGATE, action => redirectUrl = action.payload)
  })

  it('redirects to onboarding with new membership', done => {
    store.getState().people.current.memberships = [{
      community: {id: '1', name: 'Foomunity', slug: 'foomunity'}
    }]
    renderAndWait({params: {id: 'foomunity', tagName: 'bar'}}, () => {
      expect(redirectUrl).to.equal('/c/foomunity/onboarding')
      done()
    })
    // this is to compensate for the setTimeout in CommunityJoinLinkHandler
  })

  it('redirects to community profile with existing membership', done => {
    store.getState().people.current.memberships = [{
      community: {id: '1', name: 'Foomunity', slug: 'foomunity'},
      preexisting: true
    }]
    renderAndWait({params: {id: 'foomunity'}}, () => {
      expect(redirectUrl).to.equal('/c/foomunity')
      done()
    })
  })

  it('redirects to tag page with tagName param existing membership', done => {
    store.getState().people.current.memberships = [{
      community: {id: '1', name: 'Foomunity', slug: 'foomunity'},
      preexisting: true
    }]
    renderAndWait({params: {id: 'foomunity', tagName: 'bar'}}, () => {
      expect(redirectUrl).to.equal('/c/foomunity/tag/bar')
      done()
    })
  })
})
