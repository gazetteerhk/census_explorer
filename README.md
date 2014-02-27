# Hong Kong Gazetteer

Explore Hong Kong's neighborhoods through data

[![](https://raw.github.com/gazetteerhk/census_explorer/master/misc/screen-gazeteer.jpg)](http://gazetteer.hk/)

## Usage

### Data Preparation

Go to `/scripts` dir and run `python data_preparation.py`.
This script will download original xlsx files, extract cleaned data to JSON, generate translation mappping, and generate combined CSV files.

You can also generate translation files with this script by uncommenting a few lines, but this should not be necessary, as
the files are included in the repo under `/frontend/locale`

All the data files are under `/scripts/data` dir.

### Backend

   - Python
   - Flask

Make sure to install the necessary libraries by doing `pip install -r requirements.txt`.  We recommend using a `virtualenv`.

Run:

   * `python main.py` directly to start the backend API server.
   * `python debug.py` for the DEBUG version.

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
