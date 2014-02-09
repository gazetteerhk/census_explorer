import hashlib
from google.appengine.api import memcache

def require_admin(func):
    def decorated(*args, **kwargs):
        r = list(Admin.query(Admin.name=='admin'))
        if len(r) == 0 or (r[0].enabled == True and r[0].token == request.args.get('token', None)):
            # len(r) == 0: init admin
            return func(*args, **kwargs)
        else:
            return "404"
    # Without the following line, you will see the error:
    #   "View function mapping is overwriting an existing endpoint"
    decorated.__name__ = func.__name__
    return decorated

def cache_it(func):
    def decorated(*args, **kwargs):
        #logging.warning((request.query_string))
        key = hashlib.md5((request.path + request.query_string).encode('utf-8')).hexdigest()
        logging.warning('key: %s', key)
        res = memcache.get(key)
        if not res:
            cache_time = 300
            res = func(*args, **kwargs)
            memcache.add(key, res, cache_time)
        return res
    decorated.__name__ = func.__name__
    return decorated
