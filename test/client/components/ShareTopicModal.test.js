require('../support')
import { mocks, helpers } from '../../support'
import App from '../../../src/containers/App.js'
import {
  renderIntoDocument, findRenderedDOMComponentWithClass
} from 'react-addons-test-utils'
const { createElement } = helpers

describe('ShareTopicModal', () => {
  var store
  const beta_access_code = 'foocode'
  const slug = 'foomunity'
  const tagName = 'bartag'
  const currentCommunityId = 1

  const setup = () => {
    const component = createElement(App, {}, {store})
    return renderIntoDocument(component).getWrappedInstance()
  }

  beforeEach(() => {
    store = mocks.redux.store({
      pending: {},
      tagInvitationEditor: {},
      tagsByCommunity: {},
      tagPopover: {},
      notifierMessages: [],
      routing: {path: `/c/${slug}`},
      people: {current: {id: 42}},
      communities: {[slug]: {slug, beta_access_code, id: currentCommunityId}},
      currentCommunityId,
      showModal: {
        show: 'share-tag',
        params: {slug, tagName}
      }
    })
  })

  it('is rendered with correct join link', () => {
    let appNode = setup()
    let joinUrlDiv = findRenderedDOMComponentWithClass(appNode, 'join-url')
    let expected = `<label>Copy Link</label><a class="">null/c/foomunity/join/${beta_access_code}/tag/${tagName}</a>`
    expect(joinUrlDiv.innerHTML).to.equal(expected)
  })
})
