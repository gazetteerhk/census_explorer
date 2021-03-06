# Hong Kong Gazetteer

Explore Hong Kong's neighborhoods through data

[![](https://raw.github.com/gazetteerhk/census_explorer/master/misc/screen-gazeteer.jpg)](http://gazetteer.hk/)

## Usage

### Data Preparation

Go to `scripts` dir and run `python data_preparation.py`.
This script will download original xlsx files, extract cleaned data to JSON, generate translation mapping, and generate combined CSV files.

You can also generate translation files with this script by uncommenting a few lines, but this should not be necessary, as
the files are included in the repo under `/rontend/locale`

All the data files are under `backend/data` dir.

### Backend

   - Python
   - Flask

Make sure to install the necessary libraries by doing `pip install -r requirements.txt`.  We recommend using a `virtualenv`.

Run:

   * soft link the `backend/` dir to `/srv/hk_census_explorer/backend`.
   * `uwsgi uwsgi.ini` for production server.

The production server runs at port `8080` by default.
   
   * `python debug.py` for the DEBUG version.

The development server runs at port `8081` by default.

### Dockerized Backend

You can run the backend as a Docker container.  Simply do `sudo docker build .` in the project root, and it will build
the container for you.  You must still do the data preparation step first.

### Frontend

   - Node.js
   - Grunt
   - AngularJS
   - D3js
   - Leaflet
   - Google Map

`cd` into the `frontend` folder. Prepare environment:

   - `[sudo] npm install -g grunt-cli`
   - `[sudo] npm install -g bower`
   - `npm install`
   - `bower install`

Usage:

   - `grunt serve`: Start the local http server at port 9000 in `app`.
   By default the host is `0.0.0.0` to allow connections from outside the server.
   - `grunt test`: Run frontend tests.
   - `grunt build`: Execute the build process.  
   - `grunt serve:dist` will run the build process and start the server within `dist`.
   - `grunt deploy` will build and deploy the site to GitHub pages.

By default, the API will hit our servers.  If you want it to query from your local development server, you must change
the endpoint in `frontend/app/scripts/services/CensusAPI.js`

## Contribution

If you have bug report, feature request or anything to discuss,
[create an issue](https://github.com/gazetteerhk/census_explorer/issues/new) in our project repo.

For code contributions, please fork, modify and send Pull Request.

## License

See `LICENSE`

## Todo

 - Data preparation scripts dump the data into scripts/data, but the backend assumes
 the data will be in backend/data
 - Backend requires symlink of backend to /srv/hk_census_explorer/backend
