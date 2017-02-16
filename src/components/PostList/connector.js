import { connect } from 'react-redux'
import { getEditingPostIds } from '../../models/post'
import {
  navigate,
  showExpandedPost
} from '../../actions'

function mapStateToProps (state, { posts }) {
  return {
    editingPostIds: state.isMobile ? [] : getEditingPostIds(posts, state)
  }
}

const mapDispatchToProps = {
  navigate,
  showExpandedPost
}

export default connect(mapStateToProps, mapDispatchToProps)
