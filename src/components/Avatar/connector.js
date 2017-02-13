import { connect } from 'react-redux'
import { showPopoverHandler } from '../../actions'

export function mapDispatchToProps (dispatch) {
  return {
    showPopoverHandler: showPopoverHandler(dispatch)
  }
}

export default connect(null, mapDispatchToProps)
