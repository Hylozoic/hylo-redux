require('../support')
import { mocks, helpers } from '../../support'
import CommunityJoinLinkHandler from '../../../src/containers/community/CommunityJoinLinkHandler.js'
import { renderIntoDocument } from 'react-addons-test-utils'
import { NAVIGATE } from '../../../src/actions'
const { createElement } = helpers

describe('CommunityJoinLinkHandler', () => {
  var store, redirectUrl

  const setup = props => {
    const component = createElement(CommunityJoinLinkHandler, props, {store})
    renderIntoDocument(component).getWrappedInstance()
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
    setup({params: {id: 'foomunity', tagName: 'bar'}})
    // this is to compensate for the setTimeout in CommunityJoinLinkHandler
    setTimeout(() => {
      expect(redirectUrl).to.equal('/c/foomunity/onboarding')
      done()
    }, 10)
  })

  it('redirects to community profile with existing membership', done => {
    store.getState().people.current.memberships = [{
      community: {id: '1', name: 'Foomunity', slug: 'foomunity'},
      preexisting: true
    }]
    setup({params: {id: 'foomunity'}})
    // this is to compensate for the setTimeout in CommunityJoinLinkHandler
    setTimeout(() => {
      expect(redirectUrl).to.equal('/c/foomunity')
      done()
    }, 10)
  })

  it('redirects to tag page with tagName param existing membership', done => {
    store.getState().people.current.memberships = [{
      community: {id: '1', name: 'Foomunity', slug: 'foomunity'},
      preexisting: true
    }]
    setup({params: {id: 'foomunity', tagName: 'bar'}})
    // this is to compensate for the setTimeout in CommunityJoinLinkHandler
    setTimeout(() => {
      expect(redirectUrl).to.equal('/c/foomunity/tag/bar')
      done()
    }, 10)
  })
})
