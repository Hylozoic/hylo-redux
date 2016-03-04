require('../support')
import React from 'react'
import { mocks } from '../../support'
import CommunityEditor from '../../../src/containers/community/CommunityEditor'
import {
  scryRenderedDOMComponentsWithTag,
  renderIntoDocument,
  Simulate
} from 'react-addons-test-utils'
import {
  updateCommunityEditor,
  resetCommunityValidation,
  validateCommunityAttribute
} from '../../../src/actions'

let state = {
  communityValidation: {},
  communityEditor: {},
  pending: {}
}

describe('CommunityEditor', () => {
  let component, node, store
  beforeEach(() => {
    store = mocks.redux.store(state)
    component = <CommunityEditor store={store}/>
    node = renderIntoDocument(component).getWrappedInstance()
  })

  it('has a header', () => {
    let h2 = scryRenderedDOMComponentsWithTag(node, 'h2')[0]
    expect(h2.innerHTML).to.equal('Create a community')
  })

  it('responds to slug input', () => {
    Simulate.change(node.refs.slug, {target: {value: 'bar'}})
    expect(store.dispatch).to.have.been.called.exactly(3)
    expect(store.dispatch).to.have.been.called.with(updateCommunityEditor('community', {slug: 'bar'}))
    expect(store.dispatch).to.have.been.called.with(updateCommunityEditor('errors', {slugBlank: false, slugInvalid: false}))
    expect(store.dispatch).to.have.been.called.with(validateCommunityAttribute('slug', 'bar', 'unique'))
  })

  it('responds to invalid slug input', () => {
    Simulate.change(node.refs.slug, {target: {value: 'bar fly'}})
    expect(store.dispatch).to.have.been.called.exactly(3)
    expect(store.dispatch).to.have.been.called.with(updateCommunityEditor('community', {slug: 'bar fly'}))
    expect(store.dispatch).to.have.been.called.with(updateCommunityEditor('errors', {slugBlank: false, slugInvalid: true}))
    expect(store.dispatch).to.have.been.called.with(resetCommunityValidation('slug'))
  })

  it('responds to blank slug input', () => {
    Simulate.change(node.refs.slug, {target: {value: ''}})
    expect(store.dispatch).to.have.been.called.exactly(3)
    expect(store.dispatch).to.have.been.called.with(updateCommunityEditor('community', {slug: ''}))
    expect(store.dispatch).to.have.been.called.with(updateCommunityEditor('errors', {slugBlank: true, slugInvalid: false}))
    expect(store.dispatch).to.have.been.called.with(resetCommunityValidation('slug'))
  })
})
