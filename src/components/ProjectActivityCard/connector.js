import { connect } from 'react-redux'

export function mapStateToProps (state, { postId }) {
  return {
    post: state.posts[postId]
  }
}

export default connect(mapStateToProps)
