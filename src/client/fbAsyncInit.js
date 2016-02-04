import config from '../config'
const { appId } = config.facebook

const script = () => {
  window.fbAsyncInit = function () {
    FB.init({
      appId: appId,
      xfbml: true,
      version: 'v2.5'
    })
  };

  (function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
}

export default script
