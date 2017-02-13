import '../../support'
import React from 'react'
import { assign } from 'lodash'
import { mount } from 'enzyme'
import LinkedPersonSentence from '../../../../src/components/LinkedPersonSentence/component'

const currentUser = {id: 'x', name: 'John Current'}

const people = [
  {id: 'y', name: 'Sneezy'},
  {id: 'z', name: 'Itchy'},
  {id: 'w', name: 'Goofy'},
  {id: 'a', name: 'Sleepy'},
  {id: 'b', name: 'Doc'}
]

const minProps = {
  people: [people[0]],
  className: 'testing'
}

const requiredContext = { currentUser }

function renderComponent (props) {
  return mount(<LinkedPersonSentence {...assign(minProps, props)} />, {context: requiredContext})
}

describe('<LinkedPersonSentence />', () => {
  it('will render with minimum required props', () => {
    const wrapper = renderComponent()
    expect(wrapper.find('div.testing').length).to.equal(1)
  })

  it('handles one person', () => {
    const wrapper = renderComponent({people: [people[0]]})
    expect(wrapper.find('div.testing').text()).to.equal('Sneezy ')
  })

  it('handles current user', () => {
    const wrapper = renderComponent({people: [currentUser]})
    expect(wrapper.find('div.testing').text()).to.equal('You ')
  })

  it('handles the current user and one other voter', () => {
    const wrapper = renderComponent({people: [currentUser, people[0]]})
    expect(wrapper.find('div.testing').text()).to.equal('You and Sneezy ')
  })

  it('handles 2 voters', () => {
    const wrapper = renderComponent({people: people.slice(0, 2)})
    expect(wrapper.find('div.testing').text()).to.equal('Sneezy and Itchy ')
  })

  it('handles currentuser and 2 voters', () => {
    const wrapper = renderComponent({people: [currentUser, ...people.slice(0, 2)]})
    expect(wrapper.find('div.testing').text()).to.equal('You, Sneezy, and Itchy ')
  })

  it('handles 3 voters', () => {
    const wrapper = renderComponent({people: people.slice(0, 3)})
    expect(wrapper.find('div.testing').text()).to.equal('Sneezy, Itchy, and 1 other ')
  })

  it('handles 4 voters', () => {
    const wrapper = renderComponent({people: people.slice(0, 4)})
    expect(wrapper.find('div.testing').text()).to.equal('Sneezy, Itchy, and 2 others ')
  })

  it('handles 5 voters', () => {
    const wrapper = renderComponent({people: [currentUser, ...people]})
    expect(wrapper.find('div.testing').text()).to.equal('You, Sneezy, Itchy, and 3 others ')
  })
})
