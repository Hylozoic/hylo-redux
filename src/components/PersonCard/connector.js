import { connect } from 'react-redux'
import { showPopoverHandler } from '../../actions'

export function mapDispatchToProps (dispatch) {
  return {
    onMouseOver: showPopoverHandler(dispatch)
  }
}

export default connect(null, mapDispatchToProps)
