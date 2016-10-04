import React from 'react'
import Icon from '../components/Icon'
import { position } from '../util/scrolling'
import { closeModal } from '../actions'
// circular import; code smell; refactor?
import BrowseTopicsModal from '../containers/BrowseTopicsModal'
import ShareTopicModal from '../containers/ShareTopicModal'
import ExpandedPostModal from '../containers/ExpandedPostModal'
import DirectMessageModal from '../containers/DirectMessageModal'
import ChecklistModal from '../containers/ChecklistModal'
import TagEditorModal from '../containers/TagEditorModal'
import AddLogoModal from '../containers/AddLogoModal'
import InviteModal from '../containers/InviteModal'
import PostEditorModal from '../containers/PostEditorModal'
import { NotificationsModal } from '../containers/Notifications'
import cx from 'classnames'
import { get } from 'lodash'
const { array, bool, func, node, object, string, oneOfType } = React.PropTypes

export const modalWrapperCSSId = 'top-level-modal-wrapper'
const mainColumnWidth = 688 // defined in CSS

const modalStyle = isMobile => {
  if (typeof window === 'undefined') return {}
  const windowWidth = window.innerWidth 
  const pageContent = document.getElementById('cover-image-page-content')
  const webMargin = pageContent ? position(pageContent).x : (windowWidth - mainColumnWidth) / 2 
  return {
    marginLeft: isMobile ? 0
      : webMargin, 
    width: Math.min(mainColumnWidth,
      get(document.getElementById('main'), 'offsetWidth') || mainColumnWidth)
  }
}

export class BareModalWrapper extends React.Component {
  static propTypes = {children: object, onClick: func, top: bool}

  render () {
    const { children, top } = this.props
    const onClick = event => {
      if (event.target !== this.refs.backdrop) return
      return this.props.onClick(event)
    }

    return <div id={modalWrapperCSSId}>
      {top
        ? <div className='scrolling-backdrop' ref='backdrop' onClick={onClick}>
            {children}
          </div>
        : <div>
            {children}
          </div>}
    </div>
  }
}

export class ModalWrapper extends React.Component {
  static propTypes = {type: string, params: object, top: bool, bottom: bool}
  static defaultProps = {top: true}
  static contextTypes = {dispatch: func}

  lockScrolling = () => {
    window.scrollTo(0, this.lockedScrollTop)
  }

  componentDidMount () {
    if (this.props.bottom) window.addEventListener('scroll', this.lockScrolling)
  }

  componentWillUnmount () {
    if (this.props.bottom) window.removeEventListener('scroll', this.lockScrolling)
  }

  render () {
    const { type, params, top } = this.props
    const { dispatch } = this.context
    if (!type) return null

    let modal, clickToClose
    const close = () => dispatch(closeModal())
    switch (type) {
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
      case 'direct-message':
          modal = <DirectMessageModal userId={params.userId} userName={params.userName} onCancel={close}/>
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
          saveParent={params.saveParent}
          useCreatedTag={params.useCreatedTag}
          creating={params.creating}/>
        clickToClose = true
        break
      case 'add-logo':
        modal = <AddLogoModal onCancel={close}/>
        clickToClose = true
        break
      case 'invite':
        modal = <InviteModal onCancel={close}/>
        clickToClose = true
        break
      case 'post-editor':
        modal = <PostEditorModal onCancel={close}/>
        clickToClose = true
        break
    }

    return <BareModalWrapper top={top} onClick={() => clickToClose && close()}>
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
    {(title || subtitle) && <div className='title'>
      <h2>
        {title}
        {!standalone && <a className='close' onClick={onCancel}>
          <Icon name='Fail'/>
        </a>}
      </h2>
      {subtitle && <div className='subtitle'>
        {subtitle}
      </div>}
    </div>}
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
