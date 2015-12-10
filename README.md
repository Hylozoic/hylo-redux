# hylo-redux
Experimental version of the Hylo.com frontend, written with React and Redux.

## goals

* universal rendering
  * reduce client-side effort and wait time when loading the site for the first time, as in the common case of responding to an email or push notification
  * support Facebook sharing with Open Graph meta tags more easily

* client-side caching
  * more responsiveness and less network activity

* better management of complexity
  * as always: less coupling, more adaptability

## usage

use node 4+ and npm 3.

for local development, create a file named `.env` in the project root:

```
LIVERELOAD=true
PORT=9000
UPSTREAM_HOST=http://localhost:3001
LOG_LEVEL=debug
HEROKU_API_TOKEN=anything
HEROKU_APP_NAME=anything
```

create a file named `.env.test` with the same contents, except with `LOG_LEVEL` changed to `warn`, to reduce noise when running tests.

then it's just the usual: `npm install`, `npm start`, `npm test`.

it depends on a running instance of [hylo-node](https://github.com/Hylozoic/hylo-node), the location of which is set with `UPSTREAM_HOST`.
