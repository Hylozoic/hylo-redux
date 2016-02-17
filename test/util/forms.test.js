require('../support')
import { reversibleUpdate } from '../../src/util/forms'

describe('reversibleUpdate', () => {
  it('calls the specified action with expected parameters', () => {
    let action = spy(function (id, attrs, undoAttrs) {
      expect(id).to.equal('a')
      expect(attrs).to.deep.equal({foo: {bar: 'bar'}})
      expect(undoAttrs).to.deep.equal({foo: {bar: 'baz'}})
    })

    let obj = {
      id: 'a',
      foo: {bar: 'baz'}
    }

    reversibleUpdate(action, obj, 'foo.bar', 'bar')
    expect(action).to.have.been.called()
  })
})
