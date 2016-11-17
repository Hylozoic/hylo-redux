require('../support')
import EventPostEditor from '../../../src/components/EventPostEditor'
import React from 'react'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'
import { configureStore } from '../../../src/store'

describe('EventPostEditor', () => {
  it('has a datepicker', () => {
    const store = configureStore().store
    const node = mount(<Provider store={store}>
      <EventPostEditor post={{}} postEdit={{}} update={() => {}}/>
    </Provider>)

    expect(node.find('[placeholder="start time"]').length).to.equal(1)
    expect(node.find('[placeholder="end time"]').length).to.equal(1)
    node.find('[placeholder="start time"]').simulate('click')
    expect(node.find('.start-time .rdtPicker').length).to.equal(1)
  })
})
