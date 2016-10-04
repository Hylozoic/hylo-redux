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
  const currentCommunityId = '1'

  const setup = () => {
    const component = createElement(App, {location: {}}, {store})
    return renderIntoDocument(component).getWrappedInstance()
  }

  beforeEach(() => {
    store = mocks.redux.store({
      pending: {},
      tagInvitationEditor: {
        recipients: []
      },
      tagPopover: {},
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
    })
  })

  it('is rendered with correct join link', () => {
    let appNode = setup()
    let joinUrlDiv = findRenderedDOMComponentWithClass(appNode, 'copy-link')
    let expected = 'Copy Link'
    expect(joinUrlDiv.innerHTML).to.equal(expected)
  })
})
