import React from 'react'
import Icon from '../components/Icon'
import { position } from '../util/scrolling'
import { closeModal } from '../actions'
// circular import; code smell; refactor?
import BrowseTopicsModal from '../containers/BrowseTopicsModal'
import ShareTopicModal from '../containers/ShareTopicModal'
import ExpandedPostModal from '../containers/ExpandedPostModal'
import ChecklistModal from '../containers/ChecklistModal'
import TagEditorModal from '../containers/TagEditorModal'
import { NotificationsModal } from '../containers/Notifications'
import cx from 'classnames'
import { get } from 'lodash'
const { array, bool, func, node, object, string, oneOfType } = React.PropTypes

export const modalWrapperCSSId = 'top-level-modal-wrapper'
const mainColumnWidth = 688 // defined in CSS

const modalStyle = isMobile => {
  if (typeof window === 'undefined') return {}
  return {
    marginLeft: isMobile ? 0
      : position(document.getElementById('cover-image-page-content')).x,
    width: Math.min(mainColumnWidth,
      get(document.getElementById('main'), 'offsetWidth') || mainColumnWidth)
  }
}

export class BareModalWrapper extends React.Component {
  static propTypes = {children: object, onClick: func}

  render () {
    const { children } = this.props
    const onClick = event => {
      if (event.target !== this.refs.backdrop) return
      return this.props.onClick(event)
    }

    return <div id={modalWrapperCSSId}>
      <div className='scrolling-backdrop' ref='backdrop' onClick={onClick}>
        {children}
      </div>
    </div>
  }
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
    const close = () => dispatch(closeModal())
    switch (show) {
      case 'tags':
        modal = <BrowseTopicsModal onCancel={close}/>
        clickToClose = true
        break
      case 'share-tag':
        modal = <ShareTopicModal tagName={params.tagName} slug={params.slug}
          onCancel={close}/>
        clickToClose = true
        break
      case 'expanded-post':
        modal = <ExpandedPostModal id={params.id} commentId={params.commentId}/>
        clickToClose = true
        break
      case 'notifications':
        modal = <NotificationsModal onCancel={close}/>
        clickToClose = true
        break
      case 'checklist':
        modal = <ChecklistModal onCancel={close}/>
        clickToClose = true
        break
      case 'tag-editor':
        modal = <TagEditorModal onCancel={close}
          saveParent={params.save}
          updatePostTag={params.updatePostTag}/>
        clickToClose = true
    }

    return <BareModalWrapper onClick={() => clickToClose && close()}>
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
  subtitle: oneOfType([string, node]),
  standalone: bool,
  title: oneOfType([string, object])
}
Modal.contextTypes = {isMobile: bool}

export default Modal
