import React from 'react'
import Icon from '../components/Icon'
import { position } from '../util/scrolling'
import { closeModal } from '../actions'
// circular import; code smell; refactor?
import BrowseTopicsModal from '../containers/BrowseTopicsModal'
import ShareTopicModal from '../containers/ShareTopicModal'
import cx from 'classnames'
const { bool, func } = React.PropTypes

export const modalWrapperCSSId = 'top-level-modal-wrapper'

const modalStyle = (isMobile) => {
  return {
    left: isMobile ? 0 : position(document.getElementById('cover-image-page-content')).x,
    width: Math.min(688, document.getElementById('main').offsetWidth)
  }
}

export const ModalWrapper = ({ show, params }, { dispatch }) => {
  if (!show) return null

  let modal, clickToClose
  switch (show) {
    case 'tags':
      modal = <BrowseTopicsModal onCancel={() => dispatch(closeModal())}/>
      clickToClose = true
      break
    case 'share-tag':
      modal = <ShareTopicModal tagName={params.tagName} slug={params.slug}
        onCancel={() => dispatch(closeModal())}/>
      clickToClose = true
      break
  }

  const onBackdropClick = () => clickToClose && dispatch(closeModal())

  return <div id={modalWrapperCSSId}>
    <div className='backdrop' onClick={onBackdropClick}/>
    {modal}
  </div>
}
ModalWrapper.contextTypes = {dispatch: func}

export const Modal = ({ id, className, children, title, onCancel }, { isMobile }) => {
  return <div id={id} className={cx(className, 'modal')} style={modalStyle(isMobile)}>
    <h2>
      {title}
      <a className='close' onClick={onCancel}><Icon name='Fail'/></a>
    </h2>
    {children}
  </div>
}
Modal.contextTypes = {isMobile: bool}
