import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { closeModal } from '../../actions'

export function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators({closeModal}, dispatch)
  }
}

export default connect(null, mapDispatchToProps)