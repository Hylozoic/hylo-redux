import { connect } from 'react-redux'
import { map } from 'lodash/fp'
import { getPost, denormalizedPost } from '../../models/post'
import {
  fetchPost,
  followPost,
  navigate
} from '../../actions'

export function mapStateToProps (state, { post }) {
  return {
    children: map(id => denormalizedPost(getPost(id, state), state), post.children || [])
  }
}

const mapDispatchToProps = {
  fetchPost,
  followPost,
  navigate
}

export default connect(mapStateToProps, mapDispatchToProps)
