import '../support'
import { mockActionResponse, wait } from '../../support/helpers'
import React, { PropTypes } from 'react'
import { mount } from 'enzyme'
import { configureStore } from '../../../src/store'
import * as actions from '../../../src/actions'
import * as postActions from '../../../src/actions/posts'
import { CompleteRequest } from '../../../src/components/CompleteRequest'

const requestPost = {
  id: 'requestPost'
}

const contributor = {
  id: 'a',
  name: 'Adam'
}

const currentUser = {
  id: 'x'
}

const state = {
  communities: {
    foo: {id: '1', name: 'Foomunity', slug: 'foo'},
    bar: {id: '2', name: 'Barmunity', slug: 'bar'}
  },
  people: {
    current: currentUser
  },
  posts: {
    [requestPost.id]: requestPost
  }
}

const setupNode = (props) => {
  mockActionResponse(postActions.completePost(requestPost.id), {})
  mockActionResponse(actions.typeahead(contributor.name), {})
  const store = configureStore(state).store
  const defaultProps = {
    post: requestPost,
    contributorChoices: [contributor]
  }
  return mount(<CompleteRequest {...Object.assign({}, defaultProps, props)} />, {
    context: {
      currentUser,
      dispatch: store.dispatch,
      store
    },
    childContextTypes: {
      currentUser: PropTypes.object,
      store: PropTypes.object,
      dispatch: PropTypes.func
    }
  })
}

describe('CompleteRequest', () => {
  let node

  describe('with edit permissions', () => {
    beforeEach(() => {
      node = setupNode({canEdit: true})
    })

    it('can be completed (with contributors)', () => {
      expect(node.find('.toggle')).to.be.length(1)
      node.find('.toggle').simulate('change')
      expect(node.find('.request-complete-heading').text()).to.contain('Awesome')
      expect(node.find('.request-complete-people-input')).to.be.length(1)
      node.find('.request-complete-people-input a').simulate('click')
      expect(node.find('.request-complete-people-input li.tag').text())
      .to.contain(contributor.name)
      expect(node.find('.done')).to.be.length(1)
      postActions.completePost = spy(postActions.completePost)
      node.find('.done').simulate('click')
      expect(postActions.completePost).to.have.been.called.once.with([contributor])
    })

    it('can be completed (without contributors)', () => {
      expect(node.find('.toggle')).to.be.length(1)
      node.find('.toggle').simulate('change')
      expect(node.find('.done')).to.be.length(1)
      postActions.completePost = spy(postActions.completePost)
      node.find('.done').simulate('click')
      expect(postActions.completePost).to.have.been.called.once.with(requestPost.id, [])
      expect(node.find('.contributors .person')).to.be.length(0)
    })

    it('requests contributors from all communities associated with a post', () => {
      node.find('.toggle').simulate('change')
      actions.typeahead = spy(actions.typeahead)
      node.find('.request-complete-people-input input').simulate('change', {
        target: {value: contributor.name}, keyCode: 13
      })
      return wait(300, () =>
        expect(actions.typeahead).to.have.been.called.with(
          {type: 'people', communityIds: requestPost.community_ids}))
    })
  })

  describe('without edit permissions', () => {
    beforeEach(() => {
      node = setupNode({canEdit: false})
    })

    it('can\'t be completed', () => {
      expect(node.find('.toggle')).to.be.length(0)
    })
  })
})
