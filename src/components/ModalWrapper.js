import React from 'react'
const { bool, func, object, string } = React.PropTypes
import BrowseTopicsModal from './BrowseTopicsModal'
import ShareTopicModal from '../containers/ShareTopicModal'
import ExpandedPostModal from '../containers/ExpandedPostModal'
import DirectMessageModal from '../containers/DirectMessageModal'
import ChecklistModal from '../containers/ChecklistModal'
import TagEditorModal from '../containers/TagEditorModal'
import AddLogoModal from '../containers/AddLogoModal'
import InviteModal from '../containers/InviteModal'
import PostEditorModal from '../containers/PostEditorModal'
import ImageModal from '../containers/ImageModal'
import { NotificationsModal } from '../containers/Notifications'
import { ThreadsModal } from '../containers/ThreadsDropdown'
import { closeModal } from '../actions'
import { get } from 'lodash/fp'

export class ModalWrapper extends React.Component {
  static propTypes = {type: string, params: object, top: bool, bottom: bool}
  static defaultProps = {top: true}
  static contextTypes = {dispatch: func}

  lockScrolling = () => {
    window.scrollTo(0, this.lockedScrollTop)
  }

  componentDidMount () {
    if (this.props.bottom) {
      this.lockedScrollTop = document.body.scrollTop
      window.addEventListener('scroll', this.lockScrolling)
    }
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
        modal = <BrowseTopicsModal onCancel={close} community={params.community} />
        clickToClose = true
        break
      case 'share-tag':
        modal = <ShareTopicModal tagName={params.tagName} slug={params.slug}
          onCancel={close} />
        clickToClose = true
        break
      case 'expanded-post':
        modal = <ExpandedPostModal id={params.id} commentId={params.commentId} />
        clickToClose = true
        break
      case 'direct-message':
        modal = <DirectMessageModal userId={params.userId} userName={params.userName} onCancel={close} />
        clickToClose = true
        break
      case 'notifications':
        modal = <NotificationsModal onCancel={close} />
        clickToClose = true
        break
      case 'checklist':
        modal = <ChecklistModal onCancel={close} />
        clickToClose = true
        break
      case 'tag-editor':
        modal = <TagEditorModal onCancel={close}
          saveParent={params.saveParent}
          useCreatedTag={params.useCreatedTag}
          creating={params.creating} />
        clickToClose = true
        break
      case 'add-logo':
        modal = <AddLogoModal onCancel={close} />
        clickToClose = true
        break
      case 'invite':
        modal = <InviteModal onCancel={close} />
        clickToClose = true
        break
      case 'post-editor':
        modal = <PostEditorModal
          post={get('post', params)}
          tag={get('tag', params)}
          onCancel={close} />
        clickToClose = true
        break
      case 'threads':
        modal = <ThreadsModal onCancel={close} />
        break
      case 'image':
        modal = <ImageModal {...params} onCancel={close} />
        clickToClose = true
    }

    return <BareModalWrapper top={top} onClick={() => clickToClose && close()}>
      {modal}
    </BareModalWrapper>
  }
}

class BareModalWrapper extends React.Component {
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

export const modalWrapperCSSId = 'top-level-modal-wrapper'
