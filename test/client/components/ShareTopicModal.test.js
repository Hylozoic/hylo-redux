require('../support')
import React from 'react'
import { mount } from 'enzyme'
import { configureStore } from '../../../src/store'
import App from '../../../src/containers/App'
import ShareTopicModal from '../../../src/containers/ShareTopicModal'
import {
  renderIntoDocument, findRenderedDOMComponentWithClass
} from 'react-addons-test-utils'
import { createElement } from '../../support/helpers'
import { keyMap } from '../../../src/util/textInput'

describe('ShareTopicModal', () => {
  var store
  const beta_access_code = 'foocode' // eslint-disable-line camelcase
  const slug = 'foomunity'
  const tagName = 'bartag'
  const currentCommunityId = '1'

  const initialState = {
    pending: {},
    tagInvitationEditor: {
      recipients: []
    },
    typeaheadMatches: {},
    notifierMessages: [],
    routing: {path: `/c/${slug}`},
    people: {current: {id: 42}},
    communities: {[slug]: {slug, beta_access_code, id: currentCommunityId}},
    currentCommunityId,
    openModals: [{
      type: 'share-tag',
      params: {slug, tagName}
    }],
    communitiesForNetworkNav: {}
  }

  const setup = () => {
    const component = createElement(App, {location: {}}, {store})
    return renderIntoDocument(component).getWrappedInstance()
  }

  beforeEach(() => {
    store = configureStore(initialState).store
  })

  it('is rendered with correct join link', () => {
    let appNode = setup()
    let joinUrlDiv = findRenderedDOMComponentWithClass(appNode, 'copy-link')
    let expected = 'Copy Link'
    expect(joinUrlDiv.innerHTML).to.equal(expected)
  })

  it('validates emails', () => {
    const node = mount(<ShareTopicModal slug={slug} />, {
      context: {store}
    })
    const input = node.find('input[type="text"]')
    input.get(0).value = 'meow'
    input.simulate('keydown', {keyCode: keyMap.ENTER})
    input.get(0).value = 'baa'
    input.simulate('keydown', {keyCode: keyMap.ENTER})
    expect(node.find('.recipient').length).to.equal(2)

    node.find('button.ok').simulate('click')
    expect(node.find('.alert-danger').first().text())
    .to.equal('These emails are invalid: meow, baa')
  })
})
