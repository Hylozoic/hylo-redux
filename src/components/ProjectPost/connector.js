import { connect } from 'react-redux'
import { map } from 'lodash/fp'
import { getPost, denormalizedPost } from '../../models/post'

export function mapStateToProps (state, { post }) {
  return {
    children: map(id => denormalizedPost(getPost(id, state), state), post.children || [])
  }
}

export default connect(mapStateToProps)
