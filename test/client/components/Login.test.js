require('../support')
import Login, { PostLoginRedirector } from '../../../src/containers/Login'
import { configureStore } from '../../../src/store'
import { getUrlFromLocation } from '../../../src/util/navigation'
import { mount } from 'enzyme'
import React from 'react'

const redirectUrl = store => {
  const location = store.getState().routing.locationBeforeTransitions
  return location ? getUrlFromLocation(location) : null
}

describe('PostLoginRedirector', () => {
  var user, store
  var community = {id: '1', slug: 'foo'}

  beforeEach(() => {
    user = {id: 42}
  })

  const updateNode = state => {
    store = configureStore(state).store
    const node = mount(<PostLoginRedirector/>, {context: {store}})
    node.instance().getWrappedInstance().componentDidUpdate()
  }

  it("redirects to the person's profile by default", () => {
    user.memberships = [{community_id: community.id}]
    updateNode({
      login: {shouldRedirect: true},
      people: {current: user},
      communities: {foo: community}
    })
    expect(redirectUrl(store)).to.equal('/u/42')
  })

  it('redirects to the community creation form if the user has no communities', () => {
    updateNode({
      login: {shouldRedirect: true},
      people: {current: user},
      communities: {foo: community}
    })
    expect(redirectUrl(store)).to.equal('/create')
    expect(window.analytics.alias).to.have.been.called()
  })

  it('redirects to the last visited community if available', () => {
    user.settings = {currentCommunityId: community.id}
    updateNode({
      login: {shouldRedirect: true},
      people: {current: user},
      communities: {foo: community}
    })
    expect(redirectUrl(store)).to.equal('/c/foo')
    expect(window.analytics.alias).to.have.been.called()
  })

  it('redirects to a specified location', () => {
    updateNode({
      login: {shouldRedirect: true, query: {next: '/c/sandbox'}},
      people: {current: user},
      communities: {foo: community}
    })
    expect(redirectUrl(store)).to.equal('/c/sandbox')
  })
})
