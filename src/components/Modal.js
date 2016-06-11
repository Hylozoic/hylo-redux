import React from 'react'
import Icon from '../components/Icon'
import { position } from '../util/scrolling'
import { closeModal } from '../actions'
// circular import; code smell; refactor?
import BrowseTopicsModal from '../containers/BrowseTopicsModal'
import cx from 'classnames'
const { func } = React.PropTypes

export const modalWrapperCSSId = 'top-level-modal-wrapper'

const modalStyle = () => {
  return {
    left: position(document.getElementById('cover-image-page-content')).x,
    width: Math.min(688, document.getElementById('main').offsetWidth)
  }
}

export const ModalWrapper = ({ show }, { dispatch }) => {
  if (!show) return null

  let modal, clickToClose
  switch (show) {
    case 'tags':
      modal = <BrowseTopicsModal onCancel={() => dispatch(closeModal())}/>
      clickToClose = true
  }

  const onBackdropClick = () => clickToClose && dispatch(closeModal())

  return <div id={modalWrapperCSSId}>
    <div className='backdrop' onClick={onBackdropClick}/>
    {modal}
  </div>
}
ModalWrapper.contextTypes = {dispatch: func}

export const Modal = ({ id, className, children, title, onCancel }) => {
  return <div id={id} className={cx(className, 'modal')} style={modalStyle()}>
    <h2>
      {title}
      <a className='close' onClick={onCancel}><Icon name='Fail'/></a>
    </h2>
    {children}
  </div>
}
