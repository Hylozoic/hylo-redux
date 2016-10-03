import React from 'react'
import { assetUrl } from '../util/assets'
import { map } from 'lodash'
import { environment } from '../config'
var { string, object } = React.PropTypes

const isProd = environment === 'production'

const rawScript = contents =>
  <script type='text/javascript' dangerouslySetInnerHTML={{__html: contents}}></script>

const Html = props => {
  const {
    pageTitle, markup, initNewRelic, state, assetManifest, metaTags, featureFlags
  } = props
  return <html>
    <head>
      {initNewRelic && rawScript(initNewRelic)}
      <title>{pageTitle}</title>
      <link rel='stylesheet' type='text/css' href={assetUrl('/index.css')}/>
      <link rel='shortcut icon' id='favicon' href={assetUrl(`/img/favicon${isProd ? '' : 'Dev'}.png?v=2`)}/>
      <meta name='viewport' content='width=device-width, initial-scale=1.0, user-scalable=no'/>
      {map(metaTags, (val, key) => <meta property={key} content={val} key={key} />)}
      <script type='text/javascript' src='https://use.typekit.net/npw4ouq.js'></script>
      <script type='text/javascript'>{`try{Typekit.load({async:true});}catch(e){}`}</script>
    </head>
    <body>
      <div id='app' dangerouslySetInnerHTML={{__html: markup}}></div>
      {rawScript(state)}
      {rawScript(assetManifest)}
      {rawScript(featureFlags)}
      <script src={assetUrl('/index.js')} defer></script>
    </body>
  </html>
}

Html.propTypes = {
  pageTitle: string,
  markup: string,
  state: string,
  assetManifest: string,
  metaTags: object,
  initNewRelic: string,
  featureFlags: string
}

export default Html
