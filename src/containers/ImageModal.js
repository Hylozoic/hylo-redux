import React from 'react'
import Modal from '../components/Modal'
import Icon from '../components/Icon'
const { func, string } = React.PropTypes

const leftOffset = () => {
  if (typeof window === 'undefined') return 0
  const main = document.getElementById('main')
  if (!main) return 0 // this should be the case only during tests
  return main.offsetLeft
}

export default class ImageModal extends React.Component {
  static propTypes = {
    url: string,
    onCancel: func
  }

  render () {
    const { url, onCancel } = this.props

    const marginLeft = leftOffset() + 100

    const maxWidth = document.documentElement.clientWidth - marginLeft * 2

    const modalStyle = {marginLeft, width: maxWidth}
    const imgStyle = {maxWidth}

    return <Modal className='modal' id='image-modal' title='' style={modalStyle} onCancel={onCancel}>
      <div className='image-wrapper'>
        <img src={url} style={imgStyle} />
        <a className='close' onClick={onCancel}>
          <Icon name='Fail' />
        </a>
      </div>
    </Modal>
  }
}
