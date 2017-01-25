export const snippet = `
var _prum = [['id', '${process.env.PINGDOM_APP_ID}'], ['mark', 'firstbyte', (new Date()).getTime()]];
(function() {
  var s = document.getElementsByTagName('script')[0], p = document.createElement('script');
  p.async = 'async';
  p.src = '//rum-static.pingdom.net/prum.min.js';
  s.parentNode.insertBefore(p, s);
})();`

export default {snippet}
