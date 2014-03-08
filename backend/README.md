## Preparation

Before running the API server, 
make sure you have run `/scripts/data_preparation.py`.

## Usage 

### Production

   * soft link the `backend/` dir to `/srv/hk_census_explorer/backend`.
   * `uwsgi uwsgi.ini` for production server.

### Development

   * `python debug.py` for the DEBUG version.

