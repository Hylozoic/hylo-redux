import { aggregatedTags } from '../../src/models/hashtag'

describe('aggregatedTags', () => {
  it('combines tags across all communities into a single object', () => {
    const state = {
      tagsByCommunity: {
        foo: {
          tag1: {name: 'tag1', new_post_count: 5},
          tag2: {name: 'tag2', new_post_count: 5}
        },
        bar: {
          tag1: {name: 'tag1', new_post_count: 7},
          tag3: {name: 'tag3', new_post_count: 4},
          tag4: {name: 'tag4'}
        }
      }
    }

    const expected = {
      tag1: {name: 'tag1', new_post_count: 12},
      tag2: {name: 'tag2', new_post_count: 5},
      tag3: {name: 'tag3', new_post_count: 4},
      tag4: {name: 'tag4', new_post_count: 0}
    }

    expect(aggregatedTags(state)).to.deep.equal(expected)
  })
})
