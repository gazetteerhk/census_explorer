from os import path

# The data folder is already soft linked to the 'backend'
# So here the prefix is under current dir, i.e. 'script'
DIR_DATA_PREFIX = 'data'

DIR_DATA_DOWNLOAD = path.join(DIR_DATA_PREFIX, 'download')
DIR_DATA_CLEAN_JSON = path.join(DIR_DATA_PREFIX, 'clean')
DIR_DATA_GEO_NAME = path.join(DIR_DATA_PREFIX, 'geo')
DIR_DATA_COMBINED = path.join(DIR_DATA_PREFIX, 'combined')
DIR_TRANSLATION = '../frontend/app/locale'
