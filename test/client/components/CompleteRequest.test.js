import '../support'
import { wait } from '../../support/helpers'
import React from 'react'
import { mount } from 'enzyme'
import { merge } from 'lodash'
import { CompleteRequest } from '../../../src/components/CompleteRequest'

const requestPost = {
  id: 'requestPost'
}

const contributor = {
  id: 'a',
  name: 'Adam'
}

const setupNode = (withProps) => {
  const props = merge({
    post: requestPost,
    completePost: () => {},
    typeahead: () => {},
    contributorChoices: [contributor]
  }, withProps)
  return mount(<CompleteRequest {...props} />)
}

describe('CompleteRequest', () => {
  describe('with edit permissions', () => {
    it('can be completed (with contributors)', () => {
      const completePost = spy()
      const node = setupNode({canEdit: true, completePost})
      expect(node.find('.toggle')).to.be.length(1)
      node.find('.toggle').simulate('change')
      expect(node.find('.request-complete-heading').text()).to.contain('Awesome')
      expect(node.find('.request-complete-people-input')).to.be.length(1)
      node.find('.request-complete-people-input a').simulate('click')
      expect(node.find('.request-complete-people-input li.tag').text())
      .to.contain(contributor.name)
      expect(node.find('.done')).to.be.length(1)
      node.find('.done').simulate('click')
      expect(completePost).to.have.been.called.once.with([contributor])
    })

    it('can be completed (without contributors)', () => {
      const completePost = spy()
      const node = setupNode({canEdit: true, completePost})
      expect(node.find('.toggle')).to.be.length(1)
      node.find('.toggle').simulate('change')
      expect(node.find('.done')).to.be.length(1)
      node.find('.done').simulate('click')
      expect(completePost).to.have.been.called.once.with(requestPost.id, [])
      expect(node.find('.contributors .person')).to.be.length(0)
    })

    it('requests contributors from all communities associated with a post', () => {
      const typeahead = spy()
      const node = setupNode({canEdit: true, typeahead})
      node.find('.toggle').simulate('change')
      node.find('.request-complete-people-input input').simulate('change', {
        target: {value: contributor.name}, keyCode: 13
      })
      return wait(300, () =>
        expect(typeahead).to.have.been.called.with(
          {type: 'people', communityIds: requestPost.community_ids}))
    })
  })

  describe('without edit permissions', () => {
    it('can\'t be completed', () => {
      const node = setupNode({canEdit: false})
      expect(node.find('.toggle')).to.be.length(0)
    })
  })
})
