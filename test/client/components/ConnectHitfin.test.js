import React from 'react'
import { mocks, helpers } from '../../support'
import cheerio from 'cheerio'
import { renderToString } from 'react-dom/server'

import ConnectHitfin from '../../../src/components/ConnectHitfin'

const { createElement } = helpers

describe('ConnectHitfin', () => {
  describe('when user is not connected', () => {
    const current = { id: 'id', linkedAccounts: [] }
    const store = mocks.redux.store({people: {current}})

    const children = [ <h1>Do hitfin stuff</h1> ]

    const component = createElement(ConnectHitfin, {message: 'connection message', children}, {store})
    const doc = cheerio.load(renderToString(component))

    it('should display the message', () => {
      expect(doc('p').text()).to.equal('connection message')
    })

    it('should have a connect to hitfin button', () => {
      expect(doc('a').attr('class')).to.equal('button hit-fin-logo')
    })

    it('should not render the child elements', () => {
      expect(doc('h1').length).to.equal(0)
    })
  })

  describe('when user is connected', () => {
    const current = { id: 'id', linkedAccounts: [{ provider_key: 'hit-fin' }] }
    const store = mocks.redux.store({people: {current}})

    const children = [ <h1>Do hitfin stuff</h1> ]

    const component = createElement(ConnectHitfin, {message: 'connection message', children}, {store})
    const doc = cheerio.load(renderToString(component))

    it('should render the children elements', () => {
      expect(doc('h1').text()).to.equal('Do hitfin stuff')
    })
  })
})
