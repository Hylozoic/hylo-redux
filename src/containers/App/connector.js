import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { pick } from 'lodash'
import { get } from 'lodash/fp'
import {
  removeNotification,
  toggleLeftNav,
  navigate,
  notify,
  setMobileDevice
} from '../../actions'
import { getCurrentCommunity } from '../../models/community'
import { getCurrentNetwork } from '../../models/network'
import { denormalizedCurrentUser } from '../../models/currentUser'

function fetchToState ({ store, dispatch, currentUser }) {
  const { isMobile } = store.getState()
  if (!isMobile && typeof window === 'undefined' && currentUser &&
    get('settings.leftNavIsOpen', currentUser) !== false) {
    return dispatch(toggleLeftNav())
  }
}

function mapStateToProps (state, { params }) {
  return {
    ...pick(state, 'isMobile', 'leftNavIsOpen', 'notifierMessages', 'openModals', 'popover'),
    network: getCurrentNetwork(state),
    community: getCurrentCommunity(state),
    currentUser: denormalizedCurrentUser(state)
  }
}

const mapDispatchToProps = {
  removeNotification,
  toggleLeftNav,
  navigate,
  notify,
  setMobileDevice
}

export default compose(
  prefetch(fetchToState),
  connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})
)
