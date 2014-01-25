import models
from google.appengine.ext import ndb
import logging


def populate_constituency_areas(*args, **kwargs):
    """
    Loads all of the constituency areas into the database
    """
    from constituency_areas import english, traditional, simplified
    objs_to_commit = []
    for district, cas in english.items():
        for ca, code in cas.items():
            logging.info("Adding CA {} {}".format(code, ca))
            obj = models.ConstituencyArea(id=code, district=district, name_english=ca, code=code)
            objs_to_commit.append(obj)

    ndb.put_multi(objs_to_commit)
    return 'OK'
