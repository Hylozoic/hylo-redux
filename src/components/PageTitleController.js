import React from 'react'
import { connect } from 'react-redux'
import { get } from 'lodash/fp'
import { getCurrentCommunity } from '../models/community'
import { membership } from '../models/currentUser'
const { string } = React.PropTypes

@connect((state) => {
  const community = getCurrentCommunity(state)
  let count = get('new_notification_count', membership(state.people.current, community)) || 0
  let title = community ? community.name : 'Hylo'
  return {
    pageTitle: (count > 0 ? `(${count}) ` : '') + title
  }
})
export default class PageTitleController extends React.Component {

  static propTypes = {
    pageTitle: string
  }

  componentDidMount () {
    this.setPageTitle(this.props.pageTitle)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.pageTitle !== document.title) {
      this.setPageTitle(nextProps.pageTitle)
    }
  }

  setPageTitle (title) {
    document.title = title
  }

  render () {
    return <span />
  }
}
