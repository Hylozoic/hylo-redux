import React from 'react'
var { string } = React.PropTypes

class Html extends React.Component {
  static propTypes = {
    pageTitle: string,
    markup: string,
    cssBundle: string,
    jsBundle: string,
    state: string
  }

  render () {
    let {pageTitle, cssBundle, markup, state, jsBundle} = this.props
    return <html>
      <head>
        <title>{pageTitle}</title>
        <link rel='stylesheet' type='text/css' href={cssBundle}/>
        <link rel='shortcut icon' href='/favicon.ico?z' />
        <script type='text/javascript' src='//use.typekit.net/npw4ouq.js'></script>
        <script type='text/javascript'>{`try{Typekit.load();}catch(e){}`}</script>
      </head>
      <body>
        <div id='app' dangerouslySetInnerHTML={{__html: markup}}></div>
        <script src='//cdnjs.cloudflare.com/ajax/libs/tinymce/4.2.8/tinymce.min.js'></script>
        <script dangerouslySetInnerHTML={{__html: state}}></script>
        <script src={jsBundle} defer></script>
      </body>
    </html>
  }
}

export default Html

// this url has plugins embedded:
// tinymce.cachefly.net/4.2/tinymce.min.js

// this one doesn't, so plugins get fetched the first time an editor is shown:
// cdnjs.cloudflare.com/ajax/libs/tinymce/4.2.8/tinymce.min.js
