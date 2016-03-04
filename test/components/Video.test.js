require('../support')
import { convert, youtubeParams } from '../../src/components/Video'

describe('Video', () => {
  describe('url conversion', () => {
    it('handles youtube.com', () => {
      let url = 'https://www.youtube.com/watch?v=6W4L2O-JQ-w&list=PL5B18A12D0C0E384C'
      expect(convert(url)).to.equal('//www.youtube.com/embed/6W4L2O-JQ-w' + youtubeParams)
    })

    it('handles youtu.be', () => {
      let url = 'https://youtu.be/RxYFxNWeRKw'
      expect(convert(url)).to.equal('//www.youtube.com/embed/RxYFxNWeRKw' + youtubeParams)
    })

    it('handles vimeo.com', () => {
      let url = 'https://vimeo.com/70509133?foo=bar'
      expect(convert(url)).to.equal('//player.vimeo.com/video/70509133')
    })

    it('handles player.vimeo.com', () => {
      let url = 'http://player.vimeo.com/video/70509133'
      expect(convert(url)).to.equal('//player.vimeo.com/video/70509133')
    })
  })
})
