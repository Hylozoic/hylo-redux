import React from 'react'
import cx from 'classnames'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { debounce, isEmpty, pick } from 'lodash'
import { get } from 'lodash/fp'
import Notifier from '../components/Notifier'
import LiveStatusPoller from '../components/LiveStatusPoller'
import PageTitleController from '../components/PageTitleController'
import TagPopover from '../components/TagPopover'
import { removeNotification, toggleLeftNav } from '../actions'
import { iOSAppVersion, isMobile as testIsMobile } from '../client/util'
import { ModalWrapper } from '../components/Modal'
import { setMobileDevice } from '../actions'
import { getCurrentCommunity } from '../models/community'
import { getCurrentNetwork } from '../models/network'
const { array, bool, func, object } = React.PropTypes

@prefetch(({ store, dispatch }) => {
  const { isMobile, people } = store.getState()
  if (!isMobile && typeof window === 'undefined' &&
    get('settings.leftNavIsOpen', people.current)) {
    return dispatch(toggleLeftNav())
  }
})
@connect((state, { params }) => {
  const { isMobile, leftNavIsOpen, notifierMessages, showModal } = state
  const community = getCurrentCommunity(state)
  const network = getCurrentNetwork(state)
  return {
    network,
    isMobile,
    community,
    showModal,
    leftNavIsOpen,
    notifierMessages,
    currentUser: state.people.current
  }
}, null, null, {withRef: true})
export default class App extends React.Component {
  static propTypes = {
    children: object,
    community: object,
    currentUser: object,
    leftNavIsOpen: bool,
    network: object,
    notifierMessages: array,
    dispatch: func,
    isMobile: bool,
    showModal: object,
    location: object
  }

  static childContextTypes = {
    dispatch: func,
    currentUser: object,
    isMobile: bool
  }

  getChildContext () {
    return pick(this.props, 'dispatch', 'currentUser', 'isMobile')
  }

  componentDidMount () {
    const version = Number(iOSAppVersion())
    if (version < 1.7) {
      window.location = 'https://www.hylo.com/newapp'
    }

    window.addEventListener('resize', debounce(event => {
      this.props.dispatch(setMobileDevice(testIsMobile()))
    }), 1000)
  }

  render () {
    const {
      children, community, dispatch, leftNavIsOpen, notifierMessages, isMobile,
      showModal
    } = this.props

    return <div className={cx({leftNavIsOpen, isMobile, showModal: !isEmpty(showModal)})}>
      {children}

      <Notifier messages={notifierMessages}
        remove={id => dispatch(removeNotification(id))}/>
      <LiveStatusPoller community={community}/>
      <PageTitleController/>
      <TagPopover/>
      <ModalWrapper show={get('show', showModal)} params={get('params', showModal)}/>
    </div>
  }
}
