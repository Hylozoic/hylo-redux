import React from 'react'
import cx from 'classnames'
import { intercom } from '../../config'
import { debounce, isEmpty } from 'lodash'
import { get } from 'lodash/fp'
import NetworkMonitor from '../../components/NetworkMonitor'
import Notifier from '../../components/Notifier'
import LiveStatusPoller from '../../components/LiveStatusPoller'
import PageTitleController from '../../components/PageTitleController'
import Popover from '../../components/Popover'
import {
  iOSAppVersion, androidAppVersion, isMobile as testIsMobile, calliOSBridge
} from '../../client/util'
import ModalWrapper from '../../components/ModalWrapper'
import { OPENED_MOBILE_APP, NAVIGATED_FROM_PUSH_NOTIFICATION, trackEvent } from '../../util/analytics'
const { array, bool, func, object } = React.PropTypes

export default class App extends React.Component {
  static propTypes = {
    removeNotification: func.isRequired,
    navigate: func.isRequired,
    notify: func.isRequired,
    setMobileDevice: func.isRequired,
    openModals: array.isRequired,
    children: object,
    community: object,
    currentUser: object,
    leftNavIsOpen: bool,
    network: object,
    notifierMessages: array,
    isMobile: bool,
    location: object,
    popover: object
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
    const { currentUser, isMobile, location } = this.props
    const { dispatch } = this.context
    return { dispatch, currentUser, isMobile, location }
  }

  componentDidMount () {
    const { location, navigate, setMobileDevice, notify } = this.props

    const query = get('query', location) || {}

    const iOSVersion = iOSAppVersion()

    const androidVersion = androidAppVersion()

    if (iOSVersion > 0) {
      trackEvent(OPENED_MOBILE_APP, {'App Version (iOS)': iOSVersion})
    } else if (androidVersion > 0) {
      trackEvent(OPENED_MOBILE_APP, {'App Version (Android)': androidVersion})
    }

    if (iOSVersion < 1.7) {
      window.location = 'https://www.hylo.com/newapp'
    }

    if (iOSVersion >= 1.9) {
      calliOSBridge({type: 'loaded'}, path => {
        if (path) {
          navigate(path)
          trackEvent(NAVIGATED_FROM_PUSH_NOTIFICATION, {path})
        }
      })
    }

    window.addEventListener('resize', debounce(event => {
      setMobileDevice(testIsMobile())
    }, 1000))

    if (query.notification) {
      const type = query.error ? 'error' : 'info'
      notify(query.notification, {type, maxage: null})
    }
  }

  render () {
    const {
      children, community, leftNavIsOpen, notifierMessages, openModals,
      popover, currentUser, location, isMobile, removeNotification
    } = this.props

    const classes = cx({
      leftNavIsOpen,
      loggedIn: !!currentUser,
      loggedOut: !currentUser,
      showModal: !isEmpty(openModals)
    })

    const { pathname } = location || {}
    const showIntercomButton = pathname && !pathname.startsWith('/t/')
    const showPopover = !isEmpty(popover) && !isMobile

    return <div className={classes}>
      {children}

      <NetworkMonitor />
      <Notifier messages={notifierMessages}
        remove={id => removeNotification(id)} />
      <LiveStatusPoller community={community} />
      <PageTitleController />
      {showPopover && <Popover {...{popover}} />}
      {openModals.map((modal, i) =>
        <ModalWrapper key={i}
          bottom={i === 0}
          top={i === openModals.length - 1}
          type={modal.type}
          params={modal.params} />)}
      {showIntercomButton && <IntercomButton />}
    </div>
  }
}

function IntercomButton () {
  const href = `mailto:${intercom.appId}@incoming.intercom.io`
  const id = 'custom-intercom-launcher'
  return <a {...{id, href}} target='_blank'>?</a>
}
