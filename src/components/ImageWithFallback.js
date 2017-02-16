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

  componentDidMount () {
    const { fallbackSrc, preferredSrc } = this.props
    if (!fallbackSrc) return
    const img = new Image()
    img.onload = this.handleImageLoaded
    img.src = preferredSrc
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
    const srcToUse = !fallbackSrc || preferredImageLoaded ? preferredSrc : fallbackSrc
    return <img className={className} src={srcToUse} />
  }
}
