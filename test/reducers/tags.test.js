require('../support')
import { tagsByCommunity, tagsByQuery, totalTagsByQuery } from '../../src/reducers/tags'
import {
  CREATE_POST,
  CREATE_TAG_IN_COMMUNITY,
  FETCH_COMMUNITY,
  FETCH_TAGS,
  FETCH_TAG_SUMMARY,
  REMOVE_TAG,
  UPDATE_POST
} from '../../src/actions'

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
  it('handles FETCH_TAG_SUMMARY', () => {
    const state = {
      commu: {
        wow: {
          name: 'wow'
        }
      }
    }

    const action = {
      type: FETCH_TAG_SUMMARY,
      meta: {
        id: 'commu',
        tagName: 'amaze'
      },
      payload: {
        description: 'a special word'
      }
    }

    expect(tagsByCommunity(state, action)).to.deep.equal({
      commu: {
        wow: {
          name: 'wow'
        },
        amaze: {
          name: 'amaze',
          description: 'a special word'
        }
      }
    })
  })

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

  it('adds a new tag on CREATE_POST', () => {
    const state = {
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
      wow: {
        foo: {id: 7, name: 'foo', followed: true},
        bar: {id: 8, name: 'bar', followed: true},
        bip: {name: 'bip'}
      },
      zoop: {
        bop: {name: 'bop'},
        thenewtagname: {
          name: 'thenewtagname',
          followed: true,
          description: 'its good',
          is_default: true
        }
      }
    }

    const action = {
      type: CREATE_POST,
      meta: {
        slug: 'zoop',
        createdTags: {
          thenewtagname: {description: 'its good', is_default: true}
        }
      }
    }

    expect(tagsByCommunity(state, action)).to.deep.equal(expected)
  })

  it('adds a new tag on CREATE_POST', () => {
    const state = {
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
      wow: {
        foo: {id: 7, name: 'foo', followed: true},
        bar: {id: 8, name: 'bar', followed: true},
        bip: {name: 'bip'}
      },
      zoop: {
        bop: {name: 'bop'},
        thenewtagname: {
          name: 'thenewtagname',
          followed: true,
          description: 'its good',
          is_default: true
        }
      }
    }

    const action = {
      type: UPDATE_POST,
      meta: {
        slug: 'zoop',
        params: {
          tagDescriptions: {
            thenewtagname: {description: 'its good', is_default: true}
          }
        }
      }
    }

    expect(tagsByCommunity(state, action)).to.deep.equal(expected)
  })

  it('adds a new tag on CREATE_TAG_IN_COMMUNITY', () => {
    const state = {
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
      wow: {
        foo: {id: 7, name: 'foo', followed: true},
        bar: {id: 8, name: 'bar', followed: true},
        bip: {name: 'bip'}
      },
      zoop: {
        bop: {name: 'bop'},
        thenewtagname: {
          name: 'thenewtagname',
          followed: true,
          description: 'its good',
          is_default: true
        }
      }
    }

    const action = {
      type: CREATE_TAG_IN_COMMUNITY,
      meta: {
        tag: {name: 'thenewtagname', description: 'its good', is_default: true},
        slug: 'zoop'
      }
    }

    expect(tagsByCommunity(state, action)).to.deep.equal(expected)
  })

  it('sets is_default from defaultTags on FETCH_COMMUNITY', () => {
    const state = {
      hum: {
        foo: {name: 'foo', otherStuff: {foo: 'bar'}, followed: true}
      },
      wow: {
        foo: {id: 7, name: 'foo', followed: true},
        bar: {id: 8, name: 'bar', followed: true},
        bip: {name: 'bip'}
      }
    }

    const expected = {
      hum: {
        foo: {name: 'foo', otherStuff: {foo: 'bar'}, followed: true}
      },
      wow: {
        foo: {id: 7, name: 'foo', followed: true, is_default: true},
        bar: {id: 8, name: 'bar', followed: true, is_default: false},
        bip: {name: 'bip', is_default: true}
      }
    }

    const action = {
      type: FETCH_COMMUNITY,
      payload: {
        slug: 'wow',
        defaultTags: ['foo', 'bip']
      }
    }

    expect(tagsByCommunity(state, action)).to.deep.equal(expected)
  })
})
