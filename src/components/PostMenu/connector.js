import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  pinPost,
  followPost,
  removePost,
  showModal,
  navigate,
  startPostEdit
} from '../../actions'

export function mapDispatchToProps (dispatch, { post }) {
  let actions = bindActionCreators({
    pinPost,
    followPost,
    removePost,
    showModal,
    navigate,
    startPostEdit
  }, dispatch)
  return { actions }
}

export default connect(null, mapDispatchToProps)
