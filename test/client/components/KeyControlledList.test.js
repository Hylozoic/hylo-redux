require('../support')
import mocks from '../../support/mocks'
import React from 'react'
import { KeyControlledList, KeyControlledItemList } from '../../../src/components/KeyControlledList'
import {
  renderIntoDocument,
  scryRenderedDOMComponentsWithTag,
  Simulate
} from 'react-addons-test-utils'
import { keyMap } from '../../../src/util/textInput'
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
    component = <KeyControlledList>
      {items.map(i => <span key={i.id}>i.name</span>)}
    </KeyControlledList>
    let node = renderIntoDocument(component)
    expect(node.state.selectedIndex).to.equal(0)
  })

  it('responds to arrow keys', () => {
    component = <KeyControlledList>
      {items.map(i => <span key={i.id}>i.name</span>)}
    </KeyControlledList>

    const event = {which: 40, preventDefault: () => {}}

    let node = renderIntoDocument(component)
    node.handleKeys(event)
    expect(node.state.selectedIndex).to.equal(1)

    // wrap around
    times(3, () => node.handleKeys(event))
    expect(node.state.selectedIndex).to.equal(0)
  })

  it('fires a change event on enter, and tab when tabChooses is true', () => {
    let chosenElement
    let onChange = spy(el => {
      chosenElement = el
    })
    const children = items.map(i => <span key={i.id}>i.name</span>)
    component = <KeyControlledList onChange={onChange}>
      {children}
    </KeyControlledList>
    let node = renderIntoDocument(component)

    node.handleKeys({which: 9, preventDefault: () => {}})
    expect(onChange).to.not.have.been.called

    node.handleKeys({which: 13, preventDefault: () => {}})
    expect(onChange).to.have.been.called
    expect(chosenElement.ref).to.equal(0)

    component = <KeyControlledList onChange={onChange} tabChooses selectedIndex={2}>
      {children}
    </KeyControlledList>

    node = renderIntoDocument(component)
    node.handleKeys({which: 9, preventDefault: () => {}})
    expect(onChange).to.have.been.called
    expect(chosenElement.ref).to.equal(2)
    expect(onChange).to.have.been.called.exactly(2)
  })
})

describe('KeyControlledItemList', () => {
  let component, items

  before(() => {
    items = [
      {id: 1, name: 'Foo'},
      {id: 2, name: 'Bar'},
      {id: 3, name: 'Baz'},
      {id: 4, name: 'Bonk'}
    ]
  })

  it('starts with the specified item selected', () => {
    component = <KeyControlledItemList items={items} selected={items[3]} onChange={() => {}}/>
    let node = renderIntoDocument(component)
    expect(node.refs.kcl.state.selectedIndex).to.equal(3)
  })

  it('fires a change event when clicked', () => {
    let onChange = spy(() => {})
    component = <KeyControlledItemList items={items} onChange={onChange}/>
    let node = renderIntoDocument(component)
    const lis = scryRenderedDOMComponentsWithTag(node, 'a')
    Simulate.click(lis[2])
    expect(onChange).to.have.been.called.with(items[2])
    expect(onChange).to.have.been.called.exactly(1)
  })

  it('preserves the return value of handleKeys from its child', () => {
    component = <KeyControlledItemList items={items} selected={items[3]} onChange={() => {}}/>
    const node = renderIntoDocument(component)
    const event = mocks.event({keyCode: keyMap.ENTER})
    expect(node.handleKeys(event)).to.be.true
  })
})
