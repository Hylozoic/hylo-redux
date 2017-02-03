import '../support'
import { merge } from 'lodash'
import React, { PropTypes } from 'react'
import { mount } from 'enzyme'
import { RequestCompleteHeader } from '../../../src/components/RequestCompleteHeader'

const contributor1 = {
  id: 'a',
  name: 'Adam'
}

const contributor2 = {
  id: 's',
  name: 'Suzy'
}

const completedRequest = {
  id: 'completedRequest',
  fulfilled_at: '1/1/1900',
  contributors: [contributor1, contributor2]
}

const setupNode = (withProps) => {
  const props = merge({
    post: completedRequest,
    completePost: () => {}
  }, withProps)
  return mount(<RequestCompleteHeader {...props} />)
}

describe('#request type', () => {
  it('displays the list of contributors', () => {
    const node = setupNode()
    expect(node.find('.contributors .person')).to.be.length(2)
  })

  describe('with edit permissions', () => {
    it('can be uncompleted', () => {
      const completePost = spy()
      const confirmFun = spy(() => true)
      const node = setupNode({canEdit: true, completePost, confirmFun})
      expect(node.find('.toggle')).to.be.length(1)
      node.find('.toggle').simulate('change')
      expect(completePost).to.have.been.called.once.with(completedRequest.id)
    })
  })

  describe('without edit permissions', () => {
    it('can\'t be uncompleted', () => {
      const node = setupNode({canEdit: false})
      expect(node.find('.toggle')).to.be.length(1)
      expect(node.find('.toggle')).to.be.disabled()
    })
  })
})
