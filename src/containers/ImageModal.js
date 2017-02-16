import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Modal from '../components/Modal'
import Icon from '../components/Icon'
import { closeModal } from '../actions'

const leftOffset = () => {
  if (typeof window === 'undefined') return 0
  const main = document.getElementById('main')
  if (!main) return 0 // this should be the case only during tests
  return main.offsetLeft
}

class ImageModal extends React.Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    actions: PropTypes.shape({
      closeModal: PropTypes.func.isRequired
    })
  }

  render () {
    const { url, actions: { closeModal } } = this.props

    const marginLeft = leftOffset() + 100

    const maxWidth = document.documentElement.clientWidth - marginLeft * 2

    const modalStyle = {marginLeft, width: maxWidth}
    const imgStyle = {maxWidth}

    return <Modal className='modal' id='image-modal' title='' style={modalStyle} onCancel={closeModal}>
      <div className='image-wrapper'>
        <img src={url} style={imgStyle} />
        <a className='close' onClick={closeModal}>
          <Icon name='Fail' />
        </a>
      </div>
    </Modal>
  }
}

export default connect(null, (dispatch, props) => ({
  actions: bindActionCreators({closeModal}, dispatch)
}))(ImageModal)
