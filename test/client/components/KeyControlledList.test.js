require('../support')
import React from 'react'
import KeyControlledList from '../../../src/components/KeyControlledList'
import {
  renderIntoDocument,
  scryRenderedDOMComponentsWithTag,
  Simulate
} from 'react-addons-test-utils'
import { times } from 'lodash'

describe('KeyControlledList', () => {
  let component, items

  before(() => {
    items = [
      {id: 1, name: 'Foo'},
      {id: 2, name: 'Bar'},
      {id: 3, name: 'Baz'},
      {id: 4, name: 'Bonk'}
    ]
  })

  it('defaults to having the first item selected', () => {
    component = <KeyControlledList items={items}/>
    let node = renderIntoDocument(component)
    expect(node.state.selectedIndex).to.equal(0)
  })

  it('starts with the specified item selected', () => {
    component = <KeyControlledList items={items} selected={items[3]}/>
    let node = renderIntoDocument(component)
    expect(node.state.selectedIndex).to.equal(3)
  })

  it('responds to arrow keys', () => {
    component = <KeyControlledList items={items}/>
    let node = renderIntoDocument(component)
    node.handleKeys({which: 40})
    expect(node.state.selectedIndex).to.equal(1)

    // wrap around
    times(3, () => node.handleKeys({which: 40}))
    expect(node.state.selectedIndex).to.equal(0)
  })

  it('fires a change event', () => {
    let onChange = spy(() => {})
    component = <KeyControlledList items={items} onChange={onChange}/>
    let node = renderIntoDocument(component)
    node.handleKeys({which: 13, preventDefault: () => {}})
    expect(onChange).to.have.been.called.with(items[0])

    const lis = scryRenderedDOMComponentsWithTag(node, 'a')
    Simulate.click(lis[2])
    expect(onChange).to.have.been.called.with(items[2])
    expect(onChange).to.have.been.called.exactly(2)
  })
})
