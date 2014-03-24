## Preparation

Before running the API server, 
make sure you have run `/scripts/data_preparation.py`.

## Usage 

### Production

   * soft link the `backend/` dir to `/srv/hk_census_explorer/backend`.
   * `uwsgi uwsgi.ini` for production server.

The production server runs at port `8080` by default.

### Development

   * `python debug.py` for the DEBUG version.

The development server runs at port `8081` by default.

