# Hong Kong Gazetteer

Explore Hong Kong's neighborhoods through data

## Usage

### Data Preparation

Go to `/scripts` dir and run `python data_preparation.py`.
This script will download original xlsx files, extract cleaned data to JSON, generate translation mappping, and generate combined CSV files.

## Backend

   - Python
   - Flask

Make sure to install the necessary libraries by doing `pip install -r requirements.txt`.  We recommend using a `virtualenv`.

Run:

   * `python main.py` directly to start the backend API server.
   * `python debug.py` for the DEBUG version.

## Frontend

   - Node.js
   - Grunt
   - AngularJS
   - D3js
   - Leaflet
   - Google Map

`cd` into the `frontend` folder. Prepare environment:

   - `npm install`
   - `bower install`

Usage:

   - `grunt serve` will start the local http server at port 9000 in `app`.  Note that by default the host is 0.0.0.0 to allow connections from outside the server, if you use a VM or a remote server.
   - `grunt test` will run frontend tests.
   - `grunt build` will execute the build process.  Running `grunt serve:dist` will run the build process and start the server within `dist`.  If you are deploying, it is not necessary to run this as the deploy process will build as well.
   - `grunt deploy` will build and deploy the site to Github pages.