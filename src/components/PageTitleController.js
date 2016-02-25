import React from 'react'
import { connect } from 'react-redux'
const { string } = React.PropTypes

@connect(({ pageTitle }) => ({ pageTitle }))
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
