"""
Script for downloading the raw census data for each CA
"""
import multiprocessing
import os
import urllib2

import constituency_areas
from constituency_areas import ALL_AREA_CODES, ALL_FILES
from log import logger
import config

base_path = os.path.abspath(config.DIR_DATA_DOWNLOAD)

def download_file(remote_local_pair):
    url = remote_local_pair[0]
    local_file_path = remote_local_pair[1]
    logger.info("Downloading file from {} to {}".format(url, local_file_path))
    with open(local_file_path, 'wb') as f:
        remote = urllib2.urlopen(url)
        f.write(remote.read())

def main():
    base_remote_path = "http://idds.census2011.gov.hk/Fact_sheets/CA/"

    if not os.path.exists(base_path):
        logger.info("{} does not exist, creating it".format(base_path))
        os.mkdir(base_path)

    if not os.path.isdir(base_path):
        raise RuntimeError("{} is not a folder".format(base_path))

    files_to_download = []
    skipped = []
    # A list of tuples, first element is remote url, second element is local file

    for code in ALL_AREA_CODES:
        filename = code + ".xlsx"
        url = base_remote_path + filename
        local_file_path = os.path.join(base_path, filename)
        if os.path.exists(local_file_path):
            skipped.append(local_file_path)
        else:
            files_to_download.append((url, local_file_path))

    logger.info('Downloading {} files, {} already exist (skipped)'.format(len(files_to_download), len(skipped)))
    if len(files_to_download) > 0:
        pool = multiprocessing.Pool()
        pool.map(download_file, files_to_download)

    # Check that all the files were downloaded
    files_in_folder = set(os.listdir(base_path))

    assert ALL_FILES.issubset(files_in_folder), "Some files are missing {}".format(ALL_FILES.difference(files_in_folder))
    logger.info("{} files downloaded".format(len(ALL_FILES)))

if __name__ == "__main__":
    main()
