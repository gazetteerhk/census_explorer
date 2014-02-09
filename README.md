# HK Census Explorer

Explore Hong Kong's neighborhoods through visualizations of census data

Planning document is [here](https://docs.google.com/document/d/1EUKoQ06kBGMeZaXO0tXiQRTxTekLC68V_ynm-lIzjgc/edit?usp=sharing)

# Development / Contributing

To set up a local development environment, you will need the following software:

## Backend

 - Python
 - Google App Engine SDK

Make sure to install the necessary libraries by doing `pip install -r requirements.txt`.  We recommend using a `virtualenv`.

Before you can start the local GAE dev server, you must first symlink some libraries into `backend/lib`.  The libraries are:

 - Flask
 - Wekzeug
 - Itsdangerous.py

The command to symlink when in the `lib` directory is `ln -s <source> ./`.  To find the correct path for the libraries,
you can enter the Python console and do `import flask; flask.__path__`.  This should print the path that the library is installed in.

Once you have symlinked the necessary files, you can run the devserver by typing `dev_appserver.cfg --host 0.0.0.0 --admin_host 0.0.0.0 app.yaml` from within `backend`

To deploy the backend, the command is `appcfg.py --oauth2 update ./` from within `backend`.

## Frontend

 - Node.js

To set up the front end dev environment, `cd` into the frontend folder and run `npm install`, followed by `bower install`.
This will download all of the dependencies necessary to run the frontend locally.

`grunt serve` will start the local http server at port 9000 in `app`.  Note that by default the host is 0.0.0.0 to allow connections
from outside the server, if you use a VM or a remote server.

`grunt test` will run frontend tests.

`grunt build` will execute the build process.  Running `grunt serve:dist` will run the build process and start the server
within `dist`.  If you are deploying, it is not necessary to run this as the deploy process will build as well.

`grunt deploy` will build and deploy the site to Github pages.

