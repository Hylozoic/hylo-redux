require('../support')
import { activeTooltip } from '../../src/components/Tooltip'

describe('Tooltip', () => {
  describe('activeTooltip', () => {
    it('returns the id with the lowest index', () => {
      const tooltips = {
        third: 3,
        first: 1,
        second: 2
      }
      expect(activeTooltip({}, tooltips)).to.equal('first')
    })

    it('omits viewed tooltips', () => {
      const tooltips = {
        fourth: 4,
        third: 3,
        first: 1,
        second: 2
      }
      const currentUser = {settings: {viewedTooltips: {first: true, second: true}}}
      expect(activeTooltip(currentUser, tooltips)).to.equal('third')
    })
  })
})
