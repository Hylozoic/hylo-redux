import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  navigate,
  showPopoverHandler
} from '../../actions'

export function mapDispatchToProps (dispatch) {
  const actions = bindActionCreators({
    navigate
  })
  return {
    ...actions,
    handleMouseOver: showPopoverHandler(dispatch)
  }
}

export default connect(null, mapDispatchToProps)
