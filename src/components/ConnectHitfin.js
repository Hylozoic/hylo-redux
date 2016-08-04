import React from 'react'
import { get, chain } from 'lodash'
import { connect } from 'react-redux'

@connect(({people}) => ({
  currentUser: people.current
}), null, null, {withRef: true})
export default class ConnectHitfin extends React.Component {

  isHitfinConnected (user) {
    return !!chain(user.linkedAccounts)
      .map(account => account.provider_key)
      .find(key => key === 'hit-fin')
      .value()
  }

  render () {
    return (<div>
      {
        this.isHitfinConnected(this.props.currentUser) ?
          this.props.children :
          <div>
            <p>{this.props.message}</p>
            <a className='button hit-fin-logo'> Connect HitFin Account </a>
          </div>
        }
    </div>)
  }
}
