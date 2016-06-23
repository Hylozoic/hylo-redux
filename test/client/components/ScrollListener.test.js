require('../support')
import ScrollListener from '../../../src/components/ScrollListener'
import { renderIntoDocument } from 'react-addons-test-utils'
import { helpers } from '../../support'

describe('ScrollListener', () => {
  var onBottom

  beforeEach(() => {
    onBottom = spy(() => {})
    helpers.spyify(window, 'addEventListener')
    const component = helpers.createElement(ScrollListener, {onBottom})
    renderIntoDocument(component)
    document.body.scrollHeight = 5000
    window.innerHeight = 400
  })

  afterEach(() => {
    helpers.unspyify(window, 'addEventListener')
  })

  it('does not fire onBottom when the window is not scrolled to the bottom', () => {
    window.pageYOffset = 4349
    window.dispatchEvent(new window.UIEvent('scroll'))
    expect(onBottom).not.to.have.been.called()
  })

  it('fires onBottom when the window is scrolled to the bottom', () => {
    window.pageYOffset = 4351
    window.dispatchEvent(new window.UIEvent('scroll'))
    expect(onBottom).to.have.been.called()
  })
})
