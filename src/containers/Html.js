import React from 'react'
import { assetUrl } from '../util/assets'
var { string } = React.PropTypes

class Html extends React.Component {
  static propTypes = {
    pageTitle: string,
    markup: string,
    state: string,
    assetManifest: string
  }

  render () {
    let {pageTitle, markup, state, assetManifest} = this.props
    return <html>
      <head>
        <title>{pageTitle}</title>
        <link rel='stylesheet' type='text/css' href={assetUrl('/index.css')}/>
        <link rel='shortcut icon' href='/favicon.ico?z' />
        <script type='text/javascript' src='//use.typekit.net/npw4ouq.js'></script>
        <script type='text/javascript'>{`try{Typekit.load();}catch(e){}`}</script>
        <meta name='viewport' content='width=device-width, initial-scale=1.0, user-scalable=no'/>
      </head>
      <body>
        <div id='app' dangerouslySetInnerHTML={{__html: markup}}></div>
        <script src='//cdnjs.cloudflare.com/ajax/libs/tinymce/4.2.8/tinymce.min.js'></script>
        <script dangerouslySetInnerHTML={{__html: state}}></script>
        <script dangerouslySetInnerHTML={{__html: assetManifest}}></script>
        <script src={assetUrl('/index.js')} defer></script>
      </body>
    </html>
  }
}

export default Html

// this url has plugins embedded:
// tinymce.cachefly.net/4.2/tinymce.min.js

// this one doesn't, so plugins get fetched the first time an editor is shown:
// cdnjs.cloudflare.com/ajax/libs/tinymce/4.2.8/tinymce.min.js
