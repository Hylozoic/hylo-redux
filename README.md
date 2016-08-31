# hylo-redux
Experimental version of the Hylo.com frontend, written with React and Redux.

## Goals

* universal rendering
  * reduce client-side effort and wait time when loading the site for the first time, as in the common case of responding to an email or push notification
  * support Facebook sharing with Open Graph meta tags more easily

* client-side caching
  * more responsiveness and less network activity

* better management of complexity
  * as always: less coupling, more adaptability

## Usage

Use node ^6.2.2.

For local development, create a file named `.env` in the project root:

```
LIVERELOAD=true
PORT=9000
UPSTREAM_HOST=http://localhost:3001
LOG_LEVEL=debug
HITFIN_API_URL=https://sandbox.hitfin.com
```

Create a file named `.env.test` with the same contents, except with `LOG_LEVEL` changed to `warn`, to reduce noise when running tests.

Then it's just the usual: `npm install`, `npm start`, `npm test`.

It depends on a running instance of [hylo-node](https://github.com/Hylozoic/hylo-node), the location of which is set with `UPSTREAM_HOST`.

## Running the app

Run the command `npm start`

## Deployment

The deployment code should probably be pulled out into a separate module at some point.

Create a file named `.env.deploy` in the project root, or get the variables below into your environment otherwise:
```
HEROKU_API_TOKEN=some_token
HEROKU_APP_NAME=some_app_name
```
The specified token should be one that has access to the specified app.

To deploy, first run `gulp deploy`. This will:
* Read environment variables from the Heroku app specified above (see [loadHerokuEnv.js](https://github.com/Hylozoic/hylo-redux/blob/master/tasks/loadHerokuEnv.js) for the list)
* Write a Javascript bundle to `dist/`, using the environment variables from the app
* Copy all images from `public/` to `dist/`
* Write a CSS bundle to `dist/`
* Suffix all filenames in `dist/` with hashes based on their contents using [gulp-rev](https://github.com/sindresorhus/gulp-rev)
* Upload the files to S3 (the credentials for which are also fetched from the Heroku environment)
* Set `SOURCE_VERSION` on the Heroku app to be the first 8 characters of the current commit hash (the app uses this to determine which set of uploaded assets to use)

Then run `git push heroku master` to deploy the most recent code.

## License

    Hylo is a mobile and web application to help people do more together.
    Hylo helps communities better understand who in their community has what skills,
    and how they can create things together.
    Copyright (C) 2016, Hylozoic, Inc.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
