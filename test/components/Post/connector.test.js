import '../../support'
import { mapStateToProps } from '../../../src/components/Post/connector'

const state = {
  currentCommunityId: 'testcommunity',
  communities: {
    'testcommunity': {id: 'testcommunity'}
  },
  comments: {
    'comment1': {id: 'comment1', user_id: 'testuser1'},
    'comment2': {id: 'comment2', user_id: 'testuser2'}
  },
  commentsByPost: {
    'testpost': ['comment1', 'comment2']
  },
  people: {
    'testuser1': {id: 'testuser1'},
    'testuser2': {id: 'testuser2'},
    'testuser3': {id: 'testuser3'}
  }
}

describe('Post Connector', () => {
  describe('mapStateToProps', () => {
    it('should selected and denormalize entities for a post', () => {
      const post = {
        id: 'testpost',
        user_id: ['testuser1'],
        follower_ids: ['testuser2'],
        voter_ids: ['testuser3'],
        community_ids: ['testcommunity']
      }
      const expectedProps = {
        comments: [
          {id: 'comment1', user_id: 'testuser1', user: state.people.testuser1},
          {id: 'comment2', user_id: 'testuser2', user: state.people.testuser2}
        ],
        community: {id: 'testcommunity'},
        post: {
          id: 'testpost',
          user_id: ['testuser1'],
          follower_ids: ['testuser2'],
          voter_ids: ['testuser3'],
          community_ids: ['testcommunity'],
          user: {id: 'testuser1'},
          communities: [state.communities.testcommunity],
          followers: [state.people.testuser2],
          voters: [state.people.testuser3]
        }
      }
      const props = mapStateToProps(state, { post })
      expect(props).to.deep.equal(expectedProps)
    })
  })
})
