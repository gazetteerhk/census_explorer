import models
from google.appengine.ext import ndb
import logging

from main import require_admin

def populate_constituency_areas(*args, **kwargs):
    """
    Loads all of the constituency areas into the database
    """
    from constituency_areas import english, traditional, simplified
    from district_to_regions import DISTRICT_TO_REGION_ENGLISH, DISTRICT_TO_REGION_SIMPLIFIED, DISTRICT_TO_REGION_TRADITIONAL

    objs_to_commit = {}

    for district, cas in english.items():
        for ca, code in cas.items():
            logging.info("Adding CA {} {}".format(code, ca))
            obj = models.ConstituencyArea(id=code, district=district, name_english=ca, code=code)
            obj.region_english = DISTRICT_TO_REGION_ENGLISH[district]
            objs_to_commit[code] = obj

    for district, cas in simplified.items():
        for ca, code in cas.items():
            logging.info("Adding CA {} {}".format(code, ca.encode('utf-8')))
            obj = objs_to_commit[code]
            obj.region_simplified = DISTRICT_TO_REGION_SIMPLIFIED[district]
            obj.name_simplified = ca

    for district, cas in traditional.items():
        for ca, code in cas.items():
            logging.info("Adding CA {} {}".format(code, ca.encode('utf-8')))
            obj = objs_to_commit[code]
            obj.region_traditional = DISTRICT_TO_REGION_TRADITIONAL[district]
            obj.name_traditional = ca

    ndb.put_multi(objs_to_commit.values())

    return 'OK'
