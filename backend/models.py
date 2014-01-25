# -*- coding: utf-8 -*-

from google.appengine.ext import ndb


class ConstituencyArea(ndb.Model):
    region = ndb.StringProperty()  # "Hong Kong Island", "Kowloon"
    district = ndb.StringProperty(required=True)  # "Central & Western", "Wan Chai"
    name_english = ndb.StringProperty(required=True)
    name_simplified = ndb.StringProperty()
    name_traditional = ndb.StringProperty()
    code = ndb.StringProperty(required=True)  # "A11"


class Datapoint(ndb.Model):
    constituency_area = ndb.KeyProperty(kind=ConstituencyArea, required=True)
    language = ndb.StringProperty(required=True) # 'english', 'simplified', 'traditional'
    table = ndb.StringProperty(required=True)  # "Household income", etc -- corresponds to table
    row = ndb.StringProperty(required=True)  # "2000 - 3999", "4000 - 5000"
    column = ndb.StringProperty(required=True)  # "Male", "Female", "Both sexes"
    #value = ndb.FloatProperty(required=True)
    value = ndb.FloatProperty()
