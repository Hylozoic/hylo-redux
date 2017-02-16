import React, { PropTypes } from 'react'

export default class ImageWithFallback extends React.Component {
 static propTypes = {
    preferredSrc: PropTypes.string.isRequired,
    fallbackSrc: PropTypes.string,
    className: PropTypes.string,
  }

  constructor (props) {
    super(props)
    this.state = {
      preferredImageLoaded: false
    }
  }

  handleImageLoaded = () => {
    this.setState({preferredImageLoaded: true})
  }

  render () {
    const {
      preferredSrc,
      fallbackSrc,
      className
    } = this.props
    const { preferredImageLoaded } = this.state
    if (!fallbackSrc || preferredImageLoaded) {
      return <div className={className}>
        <img src={preferredSrc} />
      </div>
    }

    const hiddenStyle = {
      display: 'none'
    }
    return <div className={className}>
      <img src={fallbackSrc} />
      <img src={preferredSrc} style={hiddenStyle} onLoad={this.handleImageLoaded} />
    </div>
  }   
}
