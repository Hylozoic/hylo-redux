import { nextPath } from '../../src/util/navigation'

describe('nextPath', () => {
  it('preserves query parameters', () => {
    const path = '/c/sandbox/people'
    const community = {slug: 'bandsox'}
    const newPath = nextPath(path, community, false, {search: 'foo'})
    expect(newPath).to.equal('/c/bandsox/people?search=foo')
  })
})
