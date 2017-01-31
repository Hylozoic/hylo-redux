import support from '../support' // eslint-disable-line no-unused-vars
import Login, { PostLoginRedirector, displayError } from '../../../src/containers/Login'
import { Provider } from 'react-redux'
import { configureStore } from '../../../src/store'
import { getUrlFromLocation } from '../../../src/util/navigation'
import { mount } from 'enzyme'
import { spyify, mockActionResponse, wait } from '../../support/helpers'
import { login } from '../../../src/actions'
import { CONTINUE_LOGIN } from '../../../src/actions/constants'
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

describe('Login', () => {
  describe('with email and password', () => {
    var store, props, actions

    before(() => {
      actions = []
      store = configureStore().store
      spyify(store, 'dispatch', action => actions.push(action))
      mockActionResponse(login('foo@bar.com', 'foobar'), {id: '42'})
      props = {location: {query: {}}}
    })

    it('works', () => {
      const node = mount(<Provider store={store}>
        <Login {...props}/>
      </Provider>)

      const email = node.find('.modal-input input[type="text"]')
      email.simulate('change', {target: {value: 'foo@bar.com'}})

      const password = node.find('.modal-input input[type="password"]')
      password.simulate('change', {target: {value: 'foobar'}})

      node.find('form').simulate('submit')

      return wait(500, () => {
        expect(actions.find(a => a.type === CONTINUE_LOGIN)).to.exist
        expect(store.getState().people.current.id).to.equal('42')
      })
    })
  })

  describe('displayError', () => {
    it('returns a message about non-password accounts', () => {
      const error = 'password account not found. available: [google-token,facebook-token]'
      const node = mount(displayError(error))
      expect(node.find('a').length).to.equal(1)
      expect(node.find('a').text()).to.equal('Set your password here.')
      expect(node.text()).to.equal('Your account has no password set. Set your password here.Or log in with Google or Facebook.')
    })
  })
})
