import React, { PropTypes } from 'react'

export default class ImageWithFallback extends React.Component {
 static propTypes = {
    preferredSrc: PropTypes.string.isRequired,
    fallbackSrc: PropTypes.string.isRequired,
    className: PropTypes.string,
    onlyUsePreferred: PropTypes.bool
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
      className,
      onlyUsePreferred
    } = this.props
    const { preferredImageLoaded } = this.state
    const usePreferred = preferredImageLoaded || onlyUsePreferred
    const srcToUse = usePreferred ? preferredSrc : fallbackSrc
    const hiddenStyle = {
      display: 'none'
    }

    return <div className={className}>
      <img src={srcToUse} />
      {!usePreferred && <img src={preferredSrc} style={hiddenStyle} onLoad={this.handleImageLoaded} />}
    </div>
  }   
}