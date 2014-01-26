import os
import sys

# required to load libraries under server/lib that Flask depends on
app_root_dir = os.path.dirname(__file__)
server_lib_dir = os.path.join(app_root_dir, 'lib')
if server_lib_dir not in sys.path:
  sys.path.insert(0, server_lib_dir)


def webapp_add_wsgi_middleware(app):
  from google.appengine.ext.appstats import recording
  app = recording.appstats_wsgi_middleware(app)
  return app


appstats_CALC_RPC_COSTS = True