require('../support')
import { tagsByCommunity, tagsByQuery, totalTagsByQuery } from '../../src/reducers/tags'
import {
  CREATE_POST,
  CREATE_TAG_IN_COMMUNITY,
  FETCH_COMMUNITY,
  FETCH_TAGS,
  FETCH_TAG_SUMMARY,
  REMOVE_TAG,
  UPDATE_COMMUNITY_TAG,
  UPDATE_POST
} from '../../src/actions/constants'

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

const createAction = {
  type: CREATE_TAG_IN_COMMUNITY,
  meta: {
    slug: 'hum',
    communityId: '3', 
    tag: {
      name: 'foo',
      description: '',
      is_default: false
    },
    owner: {
      avatar_url: 'http://something.com/image.png',
      name: 'MrMr',
      id: '21'
    }
  }, 
  payload: {id: 1}
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

  describe('on CREATE_TAG_IN_COMMUNITY', () => {
    it('appends the new tag', () => {
      const state = {
        'subject=community&id=hum': [
          {id: 3, name: 'lol'},
          {id: 2, name: 'bar'}
        ]
      }

      expect(tagsByQuery(state, createAction)).to.deep.equal({
        'subject=community&id=hum': [
          {id: 2, name: 'bar'},
          {
            id: 1,
            name: 'foo',
            memberships: [{
              created_at: null,
              description: '',
              community_id: '3',
              is_default: false,
              follower_count: 1,
              owner: {
                avatar_url: 'http://something.com/image.png',
                name: 'MrMr',
                id: '21'
              } 
            }]
          },
          {id: 3, name: 'lol'}
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

  describe('on UPDATE_COMMUNITY_TAG', () => {
    it('updates the description in the right membership in the right tag', () => {
      const state = {
        'subject=community&id=hum': [
          {id: 1, name: 'foo'},
          {
            id: 2,
            name: 'bar',
            memberships: [
              {community_id: '12', description: 'unchanging'},
              {community_id: '34', description: 'impermanent'}
            ]
          }
        ]
      }

      const expected = {
        'subject=community&id=hum': [
          {id: 1, name: 'foo'},
          {
            id: 2,
            name: 'bar',
            memberships: [
              {community_id: '12', description: 'unchanging'},
              {community_id: '34', description: 'new description'}
            ]
          }
        ]
      }

      const action = {
        type: UPDATE_COMMUNITY_TAG,
        meta: {
          name: 'bar',
          slug: 'hum',
          communityId: '34',
          params: {
            description: 'new description'
          }
        }
      }

      expect(tagsByQuery(state, action)).to.deep.equal(expected)
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

  it('increments on CREATE_TAG_IN_COMMUNITY', () => {
    const state = {
      'subject=community&id=hum': 3,
      'subject=community&id=ah': 3
    }

    expect(totalTagsByQuery(state, createAction)).to.deep.equal({
      'subject=community&id=hum': 4,
      'subject=community&id=ah': 3
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
          id: 9,
          name: 'thenewtagname',
          followed: true,
          description: 'its good',
          is_default: true,
          memberships: [{
            created_at: null,
            description: 'its good',
            community_id: '3',
            is_default: true,
            follower_count: 1,
            owner: {avatar_url: 'website-image', name: 'person', id: '25'}
          }]  
        }
      }
    }

    const action = {
      type: CREATE_TAG_IN_COMMUNITY,
      meta: {
        tag: {name: 'thenewtagname', description: 'its good', is_default: true},
        slug: 'zoop',
        communityId: '3',
        owner: {avatar_url: 'website-image', name: 'person', id: '25'}
      },
      payload: {id: 9}
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
