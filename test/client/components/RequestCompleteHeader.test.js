import '../support'
import { mockActionResponse, wait } from '../../support/helpers'
import React, { PropTypes } from 'react'
import { mount } from 'enzyme'
import { configureStore } from '../../../src/store'
import * as actions from '../../../src/actions'
import * as postActions from '../../../src/actions/posts'
import RequestCompleteHeader from '../../../src/components/RequestCompleteHeader'

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

const currentUser = { id: 'x' }

const setupNode = (props) => {
  const defaultProps = {
    post: completedRequest
  }
  const finalProps = Object.assign({}, defaultProps, props)
  return mount(<RequestCompleteHeader {...finalProps} />, {
    context: { currentUser, dispatch: () => {} }
  })
}

describe('#request type', () => {
  let node

  it('displays the list of contributors', () => {
    node = setupNode()
    expect(node.find('.contributors .person')).to.be.length(2)
  })

  describe('with edit permissions', () => {
    beforeEach(() => {
      node = setupNode({canEdit: true})
    })

    // // TODO: Mocking of imported functions in this "actions.typeahead"
    // //       pattern turns-out to be the exploitation of a bug in
    // //       Babel's ES6 implementation. For now commenting-out the test and will
    // //       move disptached actions into a mapDispatchToActions call in connect
    // //       and test with props on the component only.
    // it('can be uncompleted', () => {
    //   expect(node.find('.toggle')).to.be.length(1)
    //   postActions.completePost = spy(postActions.completePost)
    //   window.confirm = spy(() => true)
    //   node.find('.toggle').simulate('change')
    //   expect(postActions.completePost).to.have.been.called.once.with(completedRequest.id)
    // })
  })

  describe('without edit permissions', () => {
    beforeEach(() => {
      node = setupNode({ canEdit: false })
    })

    it('can\'t be uncompleted', () => {
      expect(node.find('.toggle')).to.be.length(1)
      expect(node.find('.toggle')).to.be.disabled()
    })
  })
})
