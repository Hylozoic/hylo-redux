import React from 'react'
import { navigate } from '../actions'
import { browserHistory } from 'react-router'
const { object, func } = React.PropTypes

export default class ImageViewer extends React.Component {
  static propTypes = {
    params: object
  }

  static contextTypes = {
    dispatch: func.isRequired
  }

  render () {
    const { params: { url, fromUrl } } = this.props
    const { dispatch } = this.props
    if (typeof window === 'undefined') return null

    const style = {
      maxWidth: document.documentElement.clientWidth - 20
    }

    const goBack = () => {
      if (window.history && window.history.length > 1) {
        browserHistory.goBack()
      } else {
        dispatch(navigate(fromUrl || '/app'))
      }
    }

    return <div id='image-viewer'>
      <div id='mobile-top-bar' onClick={goBack}>
        <a className='back'>
          <span className='left-angle-bracket'>&#x3008;</span>
          Back
        </a>
      </div>
      <div className='image-wrapper'>
        <img src={url} style={style} />
      </div>
    </div>
  }
}
