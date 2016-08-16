import React from 'react'
import { connect } from 'react-redux'
import { get } from 'lodash/fp'
import { getCurrentCommunity } from '../models/community'
const { string } = React.PropTypes

@connect((state) => {
  const community = getCurrentCommunity(state)
  let count = get('new_notification_count', state.people.current) || 0
  let title = community ? community.name : 'Hylo'
  return {
    pageTitle: (count > 0 ? `(${count}) ` : '') + title,
    faviconUrl: get('avatar_url', community)
  }
})
export default class PageTitleController extends React.Component {

  static propTypes = {
    pageTitle: string,
    faviconUrl: string
  }

  componentDidMount () {
    this.setPageTitle(this.props.pageTitle)
    this.setFavicon(this.props.faviconUrl)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.pageTitle !== document.title) {
      this.setPageTitle(nextProps.pageTitle)
    }

    if (nextProps.faviconUrl !== this.props.faviconUrl) {
      this.setFavicon(nextProps.faviconUrl)
    }
  }

  setPageTitle (title) {
    document.title = title
  }

  setFavicon (faviconUrl) {
    if (!faviconUrl) {
      if (!this.originalFaviconUrl) return
      faviconUrl = this.originalFaviconUrl
      this.originalFaviconUrl = null
    }
    document.head || (document.head = document.getElementsByTagName('head')[0])
    const link = document.getElementById('favicon')
    if (!link) return
    if (!this.originalFaviconUrl) {
      this.originalFaviconUrl = link.href
    }
    link.href = faviconUrl
  }

  render () {
    return <span />
  }
}
