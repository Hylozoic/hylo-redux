import { connect } from 'react-redux'
import { hidePopover } from '../../actions'

export function mapStateToProps (state, {
  popover: {
    type,
    params,
    node
  }
}) {
  return {
    type,
    params,
    node
  }
}

export default connect(mapStateToProps, {
  hidePopover
})
