import { connect } from 'react-redux'

export function mapStateToProps (state, { postId, post }) {
  return {
    post: post || state.posts[postId]
  }
}

export default connect(mapStateToProps)
