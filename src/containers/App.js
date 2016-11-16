import React from 'react'
import cx from 'classnames'
import { intercom } from '../config'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { debounce, isEmpty, pick } from 'lodash'
import { get } from 'lodash/fp'
import Notifier from '../components/Notifier'
import LiveStatusPoller from '../components/LiveStatusPoller'
import PageTitleController from '../components/PageTitleController'
import TagPopover from '../components/TagPopover'
import { removeNotification, toggleLeftNav, navigate } from '../actions'
import { iOSAppVersion, isMobile as testIsMobile, calliOSBridge } from '../client/util'
import { ModalWrapper } from '../components/Modal'
import { setMobileDevice } from '../actions'
import { getCurrentCommunity } from '../models/community'
import { getCurrentNetwork } from '../models/network'
import { denormalizedCurrentUser } from '../models/currentUser'
const { array, bool, func, object } = React.PropTypes

@prefetch(({ store, dispatch, currentUser }) => {
  const { isMobile } = store.getState()
  if (!isMobile && typeof window === 'undefined' && currentUser &&
    get('settings.leftNavIsOpen', currentUser) !== false) {
    return dispatch(toggleLeftNav())
  }
})
@connect((state, { params }) => {
  return {
    ...pick(state, 'isMobile', 'leftNavIsOpen', 'notifierMessages', 'openModals', 'tagPopover'),
    network: getCurrentNetwork(state),
    community: getCurrentCommunity(state),
    currentUser: denormalizedCurrentUser(state)
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
    openModals: array,
    location: object,
    tagPopover: object
  }

  static childContextTypes = {
    dispatch: func,
    currentUser: object,
    isMobile: bool,
    location: object
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  getChildContext () {
    const { dispatch, currentUser, isMobile, location } = this.props
    return {dispatch, currentUser, isMobile, location}
  }

  componentDidMount () {
    const version = Number(iOSAppVersion())
    if (version < 1.7) {
      window.location = 'https://www.hylo.com/newapp'
    }

    if (version >= 1.9) {
      calliOSBridge({type: 'loaded'}, path => {
        if (path) this.props.dispatch(navigate(path))
      })
    }

    window.addEventListener('resize', debounce(event => {
      this.props.dispatch(setMobileDevice(testIsMobile()))
    }, 1000))
  }

  render () {
    const {
      children, community, dispatch, leftNavIsOpen, notifierMessages,
      openModals, tagPopover, currentUser, location
    } = this.props

    const classes = cx({
      leftNavIsOpen,
      loggedIn: !!currentUser,
      loggedOut: !currentUser,
      showModal: !isEmpty(openModals)
    })

    const { pathname } = location || {}
    const showIntercomButton = pathname && !location.pathname.startsWith('/t/')

    return <div className={classes}>
      {children}

      <Notifier messages={notifierMessages}
        remove={id => dispatch(removeNotification(id))}/>
      <LiveStatusPoller community={community}/>
      <PageTitleController/>
      {!isEmpty(tagPopover) && <TagPopover {...{tagPopover}}/>}
      {openModals.map((modal, i) =>
        <ModalWrapper key={i}
          bottom={i === 0}
          top={i === openModals.length - 1}
          type={modal.type}
          params={modal.params}/>)}
      {showIntercomButton && <IntercomButton/>}
    </div>
  }
}

const IntercomButton = () => {
  const href = `mailto:${intercom.appId}@incoming.intercom.io`
  const id = 'custom-intercom-launcher'
  return <a {...{id, href}} target='_blank'>?</a>
}
