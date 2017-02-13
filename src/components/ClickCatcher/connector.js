import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  navigate,
  showPopoverHandler
} from '../../actions'

export function mapDispatchToProps (dispatch) {
  const actions = bindActionCreators({
    navigate
  }, dispatch)
  return {
    ...actions,
    handleMouseOver: showPopoverHandler(dispatch)
  }
}

export default connect(null, mapDispatchToProps)
