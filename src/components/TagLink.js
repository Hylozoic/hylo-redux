import React from 'react'
import { tagUrl } from '../routes'
import A from './A'
import cx from 'classnames'
const { string } = React.PropTypes

export default class TagLink extends React.Component {
  static propTypes = {
    tagName: string,
    slug: string
  }
 
  constructor (props) {
    super(props)
    this.state = {hidden: false}
  }

  showPopover () {
    this.setState({hidden: false})
  }

  hidePopover () {
    this.setState({hidden: true})
  }

  render () {
    let { tagName, slug } = this.props
    let { hidden } = this.state
    return <div
      onMouseOver={() => this.showPopover()}
      onMouseOut={() => this.hidePopover()}>
      <A to={tagUrl(tagName, slug)} className='hashtag'>#{tagName}</A>
      <div className={cx('popover', {hidden})} ref='popover'>
        La la lorem ipsum la la lorem ipsum <br />
        La la lorem ipsum la la lorem ipsum <br />
        La la lorem ipsum la la lorem ipsum <br />
        La la lorem ipsum la la lorem ipsum <br />
        La la lorem ipsum la la lorem ipsum <br />
      </div>
    </div>
  }
}
