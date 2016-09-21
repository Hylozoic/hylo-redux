require('../support')
import { tagsByCommunity, tagsByQuery, totalTagsByQuery } from '../../src/reducers/tags'
import { FETCH_LEFT_NAV_TAGS, FETCH_TAGS, REMOVE_TAG } from '../../src/actions'

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
    slug: 'hum',
    name: 'foo'
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

  describe('on REMOVE_TAG', () => {
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

  it('decrements on REMOVE_TAG', () => {
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

describe('tagsByCommunity', () => {
  it('removes a tag on REMOVE_TAG', () => {
    const state = {
      whee: {
        foo: {name: 'foo'},
        tag2: {name: 'tag2'}
      },
      hum: {
        foo: {name: 'foo'},
        tag2: {name: 'tag2'}
      }
    }

    expect(tagsByCommunity(state, removeAction)).to.deep.equal({
      whee: {
        foo: {name: 'foo'},
        tag2: {name: 'tag2'}
      },
      hum: {
        tag2: {name: 'tag2'}
      }
    })
  })

  it('merges tag content on FETCH_TAGS', () => {
    const state = {
      hum: {
        foo: {name: 'foo', otherStuff: {foo: 'bar'}, followed: true}
      },
      wow: {
        foo: {id: 7, name: 'foo', otherStuff: {yep: 'that'}}
      }
    }

    const expected = {
      hum: {
        foo: {id: 1, name: 'foo', otherStuff: {foo: 'bar'}, followed: true},
        bar: {id: 2, name: 'bar'}
      },
      wow: {
        foo: {id: 7, name: 'foo', otherStuff: {yep: 'that'}}
      }
    }

    expect(tagsByCommunity(state, fetchAction)).to.deep.equal(expected)
  })

  it('merges content and removes tags on FETCH_LEFT_NAV_TAGS', () => {
    const state = {
      hum: {
        foo: {name: 'foo', otherStuff: {foo: 'bar'}, followed: true}
      },
      wow: {
        foo: {id: 7, name: 'foo', followed: true},
        bar: {id: 8, name: 'bar', followed: true},
        bip: {name: 'bip'}
      },
      zoop: {
        bop: {name: 'bop'}
      }
    }

    const expected = {
      hum: {
        foo: {name: 'foo', otherStuff: {foo: 'bar'}, followed: true, new_post_count: 7},
        bar: {name: 'bar', new_post_count: 12, followed: true}
      },
      wow: {
        foo: {id: 7, name: 'foo', otherStuff: {yep: 'that'}, followed: true},
        zap: {name: 'zap', new_post_count: 11, followed: true},
        bip: {name: 'bip'} // this one isn't removed because it's not followed
      },
      zoop: {
        bop: {name: 'bop'}
      },
      zang: {
        bar: {name: 'bar', followed: true}
      }
    }

    const action = {
      type: FETCH_LEFT_NAV_TAGS,
      payload: {
        hum: [
          {name: 'foo', new_post_count: 7},
          {name: 'bar', new_post_count: 12}
        ],
        wow: [
          {name: 'foo', otherStuff: {yep: 'that'}},
          {name: 'zap', new_post_count: 11}
        ],
        zang: [
          {name: 'bar'}
        ]
      }
    }

    expect(tagsByCommunity(state, action)).to.deep.equal(expected)
  })
})
