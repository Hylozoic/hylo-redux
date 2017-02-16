import '../../support'
import React from 'react'
import { shallow, mount } from 'enzyme'
import { assign } from 'lodash'
import { wait, mockify, unspyify } from '../../../support/helpers'
import RequestHeader from '../../../../src/components/RequestHeader/component'

const contributed = {
  id: 'contributed', name: 'Adam'
}
const contributorOption = {
  id: 'contributorOption', name: 'Suzy'
}
const incompleteRequest = {
  id: 'incomplete',
  tag: 'request',
  community_ids: [77, 88]
}
const completeRequest = {
  id: 'complete',
  tag: 'request',
  fulfilled_at: '1/2/1900'
}
const contributorRequest = {
  id: 'contributors',
  tag: 'request',
  fulfilled_at: '1/2/1900',
  contributors: [contributed]
}
const regularPost = {
  id: 'regular',
  tag: ''
}

const minProps = {
  post: completeRequest,
  canEdit: true,
  completePost: () => {},
  typeahead: () => {},
  contributorChoices: [contributorOption]
}

function renderComponent (props, fullMount = false) {
  const component = <RequestHeader {...assign({}, minProps, props)} />
  return fullMount ? mount(component) : shallow(component)
}

describe('RequestHeader', () => {
  it('should render with minimum props', () => {
    const wrapper = renderComponent()
    expect(wrapper.find('.request-completed-bar')).to.be.length(1)
  })

  it('should render nothing if it\'s not a request', () => {
    mockify(console, 'error', () => {})
    renderComponent({post: regularPost})
    expect(console.error).have.been.called.once
    unspyify(console, 'error')
  })

  it('displays a completed heading', () => {
    const wrapper = renderComponent({post: completeRequest})
    expect(wrapper.find('.toggle').prop('checked')).to.be.true
    expect(wrapper.find('div.contributors').text()).to.contain('has been completed')
  })

  it('displays a completed heading with contributors', () => {
    const wrapper = renderComponent({post: contributorRequest})
    expect(wrapper.find('.toggle').prop('checked')).to.be.true
    expect(wrapper.find('Connect(LinkedPersonSentence)').prop('people'))
      .to.deep.equal([contributed])
  })

  describe('without edit permissions', () => {
    const props = {canEdit: false}

    it('doesn\'t display the incomplete header', () => {
      const wrapper = renderComponent({...props, post: incompleteRequest})
      expect(wrapper.html()).to.be.null
    })

    it('displays complete headear but can\'t be uncompleted', () => {
      const wrapper = renderComponent({...props, post: completeRequest})
      expect(wrapper.find('.toggle').prop('checked')).to.be.true
      expect(wrapper.find('.toggle').prop('disabled')).to.be.true
    })
  })

  describe('with edit permission', () => {
    describe('for an incomplete request', () => {
      const props = {post: incompleteRequest, canEdit: true}

      it('displays the incomplete heading', () => {
        const wrapper = renderComponent(props)
        expect(wrapper.find('.toggle').prop('checked')).to.be.false
        expect(wrapper.find('p').text()).to.contain('Click the checkmark')
      })

      it('shows contributor selector when complete is checked', () => {
        const wrapper = renderComponent(props)
        wrapper.find('.toggle').simulate('change')
        expect(wrapper.find('TagInput')).to.be.length(1)
      })

      it('allows a request to be completed (without contributors)', () => {
        const completePost = spy()
        const wrapper = renderComponent({...props, completePost})
        wrapper.find('.toggle').simulate('change')
        expect(wrapper.find('.request-complete-heading').text()).to.contain('Awesome')
        wrapper.find('.done').simulate('click')
        expect(completePost).to.have.been.called.once.with()
      })

      it('allow a request to be completed (with contributors)', () => {
        const completePost = spy()
        const wrapper = renderComponent({...props, completePost}, true)
        wrapper.find('.toggle').simulate('change')
        expect(wrapper.find('.request-complete-heading').text()).to.contain('Awesome')
        wrapper.find('.request-complete-people-input a').simulate('click')
        expect(wrapper.find('.request-complete-people-input li.tag').text())
          .to.contain(contributorOption.name)
        wrapper.find('.done').simulate('click')
        expect(completePost).to.have.been.called.once.with([contributorOption])
      })

      it('requests contributors from all communities associated with a post', () => {
        const typeahead = spy()
        const wrapper = renderComponent({...props, typeahead}, true)
        wrapper.find('.toggle').simulate('change')
        wrapper.find('.request-complete-people-input input').simulate('change', {
          target: {value: contributorOption.name}, keyCode: 13
        })
        return wait(300, () =>
          expect(typeahead).to.have.been.called.with(
            {type: 'people', communityIds: incompleteRequest.community_ids})
          )
      })
    })

    describe('for a complete request', () => {
      const props = {post: contributorRequest, canEdit: true}

      it('can be uncompleted', () => {
        const completePost = spy()
        const confirmFun = spy(() => true)
        const wrapper = renderComponent({...props, confirmFun, completePost})
        expect(wrapper.find('.toggle')).to.be.length(1)
        wrapper.find('.toggle').simulate('change')
        expect(completePost).to.have.been.called.once.with(contributorRequest.id)
      })
    })
  })
})
