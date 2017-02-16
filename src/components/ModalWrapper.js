import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
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

class ModalWrapper extends React.Component {
  static propTypes = {
    type: string,
    params: object,
    top: bool,
    bottom: bool,
    actions: object.isRequired
  }
  static defaultProps = {top: true}

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
    const { type, params, top, actions: { closeModal } } = this.props
    if (!type) return null

    let modal, clickToClose
    switch (type) {
      case 'tags':
        modal = <BrowseTopicsModal community={params.community} onCancel={closeModal} />
        clickToClose = true
        break
      case 'share-tag':
        modal = <ShareTopicModal tagName={params.tagName} slug={params.slug} />
        clickToClose = true
        break
      case 'expanded-post':
        modal = <ExpandedPostModal id={params.id} commentId={params.commentId} />
        clickToClose = true
        break
      case 'direct-message':
        modal = <DirectMessageModal userId={params.userId}
          userName={params.userName} />
        clickToClose = true
        break
      case 'notifications':
        modal = <NotificationsModal />
        clickToClose = true
        break
      case 'checklist':
        modal = <ChecklistModal />
        clickToClose = true
        break
      case 'tag-editor':
        modal = <TagEditorModal
          saveParent={params.saveParent}
          useCreatedTag={params.useCreatedTag}
          creating={params.creating} />
        clickToClose = true
        break
      case 'add-logo':
        modal = <AddLogoModal />
        clickToClose = true
        break
      case 'invite':
        modal = <InviteModal />
        clickToClose = true
        break
      case 'post-editor':
        modal = <PostEditorModal post={get('post', params)}
          tag={get('tag', params)} />
        break
      case 'threads':
        modal = <ThreadsModal />
        break
      case 'image':
        modal = <ImageModal {...params} onCancel={closeModal} />
        clickToClose = true
    }

    return <BareModalWrapper top={top} onClick={clickToClose ? closeModal : () => {}}>
      {modal}
    </BareModalWrapper>
  }
}

export default connect(null, (dispatch, props) => ({
  actions: bindActionCreators({closeModal}, dispatch)
}))(ModalWrapper)

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
