require('../support')
import communitiesForNetworkNav from '../../src/reducers/communitiesForNetworkNav'
import { FETCH_COMMUNITIES_FOR_NETWORK_NAV } from '../../src/constants'

const fetchAction = {
  type: FETCH_COMMUNITIES_FOR_NETWORK_NAV,
  payload: [
    {slug: 'foo', name: 'Foo'},
    {slug: 'bar', name: 'Bar'}
  ],
  meta: {
    networkId: 123
  }
}

describe('communitiesForNetworkNav', () => {
  describe('on FETCH_COMMUNITIES_FOR_NETWORK_NAV', () => {
    it('stores communities', () => {
      const state = {
        45: [{slug: 'baz', name: 'Baz'}]
      }
      expect(communitiesForNetworkNav(state, fetchAction)).to.deep.equal({
        123: [
          {slug: 'foo', name: 'Foo'},
          {slug: 'bar', name: 'Bar'}
        ],
        45: [
          {slug: 'baz', name: 'Baz'}
        ]
      })
    })
  })
})
