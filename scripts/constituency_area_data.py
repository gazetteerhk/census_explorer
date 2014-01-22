"""
Script for downloading the raw census data for each CA
"""
import multiprocessing
import os
import constituency_areas
import urllib2
import logging

logger = logging.getLogger('log')
logger.setLevel(logging.DEBUG)
log_formatter = logging.Formatter('%(asctime)s - %(module)s - %(levelname)s - %(message)s',
                                  datefmt='%Y-%m-%d %H:%M:%S')
# Log to console
logstream = logging.StreamHandler()
logstream.setLevel(logging.INFO)
logstream.setFormatter(log_formatter)
logger.addHandler(logstream)


# Path for the Excel Spreadsheets appears to be:
# http://idds.census2011.gov.hk/Fact_sheets/CA/N06.xlsx
# Where the file name is the district code

area_codes = [x.upper() for x in constituency_areas.english['All Districts'].values()]

base_remote_path = "http://idds.census2011.gov.hk/Fact_sheets/CA/"
base_path = os.path.abspath("./data")
if not os.path.exists(base_path):
    logger.info("{} does not exist, creating it".format(base_path))
    os.mkdir(base_path)

if not os.path.isdir(base_path):
    raise RuntimeError("{} is not a folder".format(base_path))

files_to_download = []  # A list of tuples, first element is remote url, second element is local file
for code in area_codes:
    filename = code + ".xlsx"
    url = base_remote_path + filename
    local_file_path = os.path.join(base_path, filename)
    files_to_download.append((url, local_file_path))


def download_file(remote_local_pair):
    url = remote_local_pair[0]
    local_file_path = remote_local_pair[1]
    logger.info("Downloading file from {} to {}".format(url, local_file_path))
    with open(local_file_path, 'wb') as f:
        remote = urllib2.urlopen(url)
        f.write(remote.read())

pool = multiprocessing.Pool()
pool.map(download_file, files_to_download)