import React from 'react'
import Icon from '../components/Icon'
import { position } from '../util/scrolling'
import { closeModal } from '../actions'
// circular import; code smell; refactor?
import BrowseTopicsModal from '../containers/BrowseTopicsModal'
import ShareTopicModal from '../containers/ShareTopicModal'
import ExpandedPostModal from '../containers/ExpandedPostModal'
import { NotificationsModal } from '../containers/Notifications'
import cx from 'classnames'
import { get } from 'lodash'
const { array, bool, func, object, string, oneOfType } = React.PropTypes

export const modalWrapperCSSId = 'top-level-modal-wrapper'
const mainColumnWidth = 688 // defined in CSS

const modalStyle = isMobile => {
  if (typeof window === 'undefined') return {}
  return {
    left: isMobile ? 0
      : position(document.getElementById('cover-image-page-content')).x,
    width: Math.min(mainColumnWidth,
      get(document.getElementById('main'), 'offsetWidth') || mainColumnWidth)
  }
}

export const BareModalWrapper = ({ children, onClick }) => {
  return <div id={modalWrapperCSSId}>
    <div className='backdrop' onClick={onClick}/>
    {children}
  </div>
}

export class ModalWrapper extends React.Component {
  static propTypes = {show: string, params: object}
  static contextTypes = {dispatch: func}

  lockScrolling = () => {
    window.scrollTo(0, this.lockedScrollTop)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.show && !this.props.show) {
      this.lockedScrollTop = document.body.scrollTop
      window.addEventListener('scroll', this.lockScrolling)
    } else if (!nextProps.show && this.props.show) {
      window.removeEventListener('scroll', this.lockScrolling)
    }
  }

  render () {
    const { show, params } = this.props
    const { dispatch } = this.context
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
        modal = <ExpandedPostModal id={params.id} commentId={params.commentId}/>
        clickToClose = true
        break
      case 'notifications':
        modal = <NotificationsModal/>
        clickToClose = true
    }

    return <BareModalWrapper onClick={() => clickToClose && dispatch(closeModal())}>
      {modal}
    </BareModalWrapper>
  }
}

export const ModalContainer = (props, { isMobile }) => {
  const { id, className, children, standalone } = props
  return <div id={id} className={cx(className, 'modal')}
    style={standalone ? {} : modalStyle(isMobile)}>
    {children}
  </div>
}
ModalContainer.propTypes = {
  id: string,
  children: oneOfType([array, object]),
  className: string,
  standalone: bool
}
ModalContainer.contextTypes = {isMobile: bool}

export const Modal = (props, { isMobile }) => {
  const { children, title, subtitle, onCancel, standalone } = props
  return <ModalContainer {...props}>
    <div className='title'>
      <h2>
        {title}
        {!standalone && <a className='close' onClick={onCancel}>
          <Icon name='Fail'/>
        </a>}
      </h2>
      {subtitle && <div className='subtitle'>
        {subtitle}
      </div>}
    </div>
    {children}
  </ModalContainer>
}
Modal.propTypes = {
  id: string,
  children: oneOfType([array, object]),
  className: string,
  onCancel: func,
  subtitle: string,
  standalone: bool,
  title: string
}
Modal.contextTypes = {isMobile: bool}

export default Modal
