require('../support')
import { toggleIncludes } from '../../src/reducers/util'

describe('toggleIncludes', () => {
  it('adds an element', () => {
    expect(toggleIncludes(['f', {x: 'h'}], {x: 'g'})).to.deep.equal(['f', {x: 'h'}, {x: 'g'}])
  })

  it('removes an element', () => {
    expect(toggleIncludes(['f', {x: 'g'}], {x: 'g'})).to.deep.equal(['f'])
  })
})
