import React from 'react'
import Icon from '../components/Icon'
import { position } from '../util/scrolling'
import { closeModal } from '../actions'
// circular import; code smell; refactor?
import BrowseTopicsModal from '../containers/BrowseTopicsModal'
import ShareTopicModal from '../containers/ShareTopicModal'
import ExpandedPostModal from '../containers/ExpandedPostModal'
import cx from 'classnames'
import { get } from 'lodash'
const { bool, func } = React.PropTypes

export const modalWrapperCSSId = 'top-level-modal-wrapper'

const modalStyle = (isMobile) => {
  return {
    left: isMobile ? 0 : position(document.getElementById('cover-image-page-content')).x,
    width: Math.min(688, get(document.getElementById('main'), 'offsetWidth') || 688)
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
    case 'expanded-post':
      modal = <ExpandedPostModal tagName={params.tagName}
        id={params.id}
        commentId={params.commentId}
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

export const Modal = ({ id, className, children, title, subtitle, onCancel }, { isMobile }) => {
  return <SimpleModal id={id} className={className}>
    <div className='titles'>
      <h2>
        {title}
        <a className='close' onClick={onCancel}><Icon name='Fail'/></a>
      </h2>
      {subtitle && <div className='subtitle'>
        {subtitle}
      </div>}
    </div>
    {children}
  </SimpleModal>
}
Modal.contextTypes = {isMobile: bool}

export class SimpleModal extends React.Component {
  static propTypes = {
    id: string,
    className: string,
    children: oneOfType([array, object])
  }

  static contextTypes = {
    isMobile: bool
  }

  lockScrolling = () => {
    window.scrollTo(0, this.lockedScrollTop)
  }

  componentDidMount () {
    this.lockedScrollTop = document.body.scrollTop
    window.addEventListener('scroll', this.lockScrolling)
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this.lockScrolling)
  }

  render () {
    const { id, className, children } = this.props
    const { isMobile } = this.context
    return <div id={id} className={cx(className, 'modal')} style={modalStyle(isMobile)}>
      {children}
    </div>
  }
}
