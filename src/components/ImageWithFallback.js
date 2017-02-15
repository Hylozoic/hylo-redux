import React, { PropTypes } from 'react'

export default class ImageWithFallback extends React.Component {
 static propTypes = {
    preferredSrc: PropTypes.string.isRequired,
    fallbackSrc: PropTypes.string.isRequired,
    useClass: PropTypes.string
  }

  constructor (props) {
    super(props)
    this.state = {
      imageStatus: false
    }
  }

  handleImageLoaded = () => {
    this.setState({imageStatus: true});
  }

  render () {
    const {
      preferredSrc,
      fallbackSrc,
      useClass
    } = this.props
    const { imageStatus } = this.state
    
    const srcToUse = imageStatus ? preferredSrc : fallbackSrc
    const hiddenStyle = {
      display: 'none'
    }

    return <div className={useClass}>
      <img src={srcToUse} />
      {!imageStatus && <img src={preferredSrc} style={hiddenStyle} onLoad={this.handleImageLoaded} />}
    </div>
  }   
}