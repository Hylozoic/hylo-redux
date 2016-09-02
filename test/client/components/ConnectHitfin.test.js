import React from 'react'
import { mocks, helpers } from '../../support'
import cheerio from 'cheerio'
import { renderToString } from 'react-dom/server'
import { 
  findRenderedDOMComponentWithClass,
  renderIntoDocument,
  Simulate } 
  from 'react-addons-test-utils'

import ConnectHitfin from '../../../src/components/ConnectHitfin'

const { click } = Simulate
const { createElement } = helpers

let component, node, store

const render = (state, post, postEdit, storeSetupCallback) => {
  store = mocks.redux.store(state)
  if (storeSetupCallback) storeSetupCallback(store)
  const context = {store, dispatch: store.dispatch, currentUser}
  component = createElement(ProjectPostEditor, { post, postEdit, update: () => {} }, context)
  node = renderIntoDocument(component).getWrappedInstance()
}

describe('ConnectHitfin', () => {
  describe('when user is not connected', () => {
    const current = { id: 'id', linkedAccounts: [] }
    const store = mocks.redux.store({people: {current}})

    const children = [ <h1 key='key'>Do hitfin stuff</h1> ]

    const component = createElement(ConnectHitfin, {message: 'connection message', children}, {store})
    const doc = cheerio.load(renderToString(component))

    beforeEach(() => {
      window.open = spy(() => {})
    })

    afterEach(() => {
      window.open = window._originalOpen
    })

    it('should display the message', () => {
      expect(doc('p').text()).to.equal('connection message')
    })

    it('should have a clickable connect to hitfin button', () => {
      expect(doc('a').attr('class')).to.equal('button hit-fin-logo')
      const node = renderIntoDocument(component).getWrappedInstance()
      let linkBtn = findRenderedDOMComponentWithClass(node, 'hit-fin-logo')
      click(linkBtn)
      expect(window.open).to.have.been.called()
    })

    it('should not render the child elements', () => {
      expect(doc('h1').length).to.equal(0)
    })
  })

  describe('when user is connected', () => {
    const current = { id: 'id', linkedAccounts: [{ provider_key: 'hit-fin' }] }
    const store = mocks.redux.store({people: {current}})

    const children = [ <h1  key='key'>Do hitfin stuff</h1> ]

    const component = createElement(ConnectHitfin, {message: 'connection message', children}, {store})
    const doc = cheerio.load(renderToString(component))

    it('should render the children elements', () => {
      expect(doc('h1').text()).to.equal('Do hitfin stuff')
    })
  })
})
