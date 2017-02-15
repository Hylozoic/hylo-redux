import { connect } from 'react-redux'
import {
  removeComment,
  thank,
  updateCommentEditor,
  showImage
} from '../../actions'

export default connect(null, {
  removeComment,
  thank,
  updateCommentEditor,
  showImage
})
