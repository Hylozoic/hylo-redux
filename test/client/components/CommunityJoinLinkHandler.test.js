require('../support')
import { mocks, helpers } from '../../support'
import CommunityJoinLinkHandler from '../../../src/containers/community/CommunityJoinLinkHandler.js'
import { renderIntoDocument } from 'react-addons-test-utils'
import { NAVIGATE } from '../../../src/actions'
const { createElement } = helpers

describe('CommunityJoinLinkHandler', () => {
  var store, redirectUrl

  const renderAndWait = (props, callback) => {
    const component = createElement(CommunityJoinLinkHandler, props, {store})
    renderIntoDocument(component).getWrappedInstance()
    return helpers.wait(10, callback)
  }

  beforeEach(() => {
    store = mocks.redux.store({
      people: {current: {id: 42}},
      errors: {}
    })
    store.transformAction(NAVIGATE, action => redirectUrl = action.payload)
  })

  it('redirects to onboarding with new membership', () => {
    store.getState().people.current.memberships = [{
      community: {id: '1', name: 'Foomunity', slug: 'foomunity'}
    }]
    return renderAndWait({params: {id: 'foomunity', tagName: 'bar'}}, () => {
      expect(redirectUrl).to.equal('/c/foomunity/onboarding')
    })
    // this is to compensate for the setTimeout in CommunityJoinLinkHandler
  })

  it('redirects to community profile with existing membership', () => {
    store.getState().people.current.memberships = [{
      community: {id: '1', name: 'Foomunity', slug: 'foomunity'},
      preexisting: true
    }]
    return renderAndWait({params: {id: 'foomunity'}}, () => {
      expect(redirectUrl).to.equal('/c/foomunity')
    })
  })

  it('redirects to tag page with tagName param existing membership', () => {
    store.getState().people.current.memberships = [{
      community: {id: '1', name: 'Foomunity', slug: 'foomunity'},
      preexisting: true
    }]
    return renderAndWait({params: {id: 'foomunity', tagName: 'bar'}}, () => {
      expect(redirectUrl).to.equal('/c/foomunity/tag/bar')
    })
  })
})
