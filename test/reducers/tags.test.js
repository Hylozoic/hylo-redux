require('../support')
import { tagsByQuery, totalTagsByQuery } from '../../src/reducers/tags'
import { FETCH_TAGS, REMOVE_TAG } from '../../src/actions'

const fetchAction = {
  type: FETCH_TAGS,
  payload: {
    items: [
      {id: 1, name: 'foo'},
      {id: 2, name: 'bar'}
    ],
    total: 70
  },
  meta: {
    cache: {
      id: 'subject=community&id=hum'
    }
  }
}

const removeAction = {
  type: REMOVE_TAG,
  meta: {
    id: 1,
    slug: 'hum'
  }
}

describe('tagsByQuery', () => {
  describe('on FETCH_TAGS', () => {
    it('stores tags', () => {
      expect(tagsByQuery({}, fetchAction)).to.deep.equal({
        'subject=community&id=hum': [
          {id: 1, name: 'foo'},
          {id: 2, name: 'bar'}
        ]
      })
    })

    it('appends new tags', () => {
      const state = {
        'subject=community&id=hum': [
          {id: 3, name: 'lol'},
          {id: 2, name: 'bar'}
        ]
      }

      expect(tagsByQuery(state, fetchAction)).to.deep.equal({
        'subject=community&id=hum': [
          {id: 3, name: 'lol'},
          {id: 2, name: 'bar'},
          {id: 1, name: 'foo'}
        ]
      })
    })
  })

  describe('on REMOVE_TAGS', () => {
    it('removes a tag', () => {
      const state = {
        'subject=community&id=hum': [
          {id: 1, name: 'foo'},
          {id: 2, name: 'bar'}
        ]
      }

      expect(tagsByQuery(state, removeAction)).to.deep.equal({
        'subject=community&id=hum': [
          {id: 2, name: 'bar'}
        ]
      })
    })
  })
})

describe('totalTagsByQuery', () => {
  it('stores a count on FETCH_TAGS', () => {
    const state = {
      'subject=community&id=wow': 7
    }

    expect(totalTagsByQuery(state, fetchAction)).to.deep.equal({
      'subject=community&id=wow': 7,
      'subject=community&id=hum': 70
    })
  })

  it('decrements on REMOVE_TAGS', () => {
    const state = {
      'subject=community&id=hum': 3,
      'subject=community&id=ah': 3
    }

    expect(totalTagsByQuery(state, removeAction)).to.deep.equal({
      'subject=community&id=hum': 2,
      'subject=community&id=ah': 3
    })
  })
})
