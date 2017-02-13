import { connect } from 'react-redux'
import { showPopoverHandler } from '../../actions/popovers'

export function mapDispatchToProps (dispatch) {
  return {
    onMouseOver: showPopoverHandler(dispatch)
  }
}

export default connect(null, mapDispatchToProps)
