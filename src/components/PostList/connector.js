import { connect } from 'react-redux'
import { getEditingPostIds } from '../../models/post'

function mapStateToProps (state, { posts }) {
  return {
    editingPostIds: state.isMobile ? [] : getEditingPostIds(posts, state)
  }
}

export default connect(mapStateToProps)
