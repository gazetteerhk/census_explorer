import sh

from log import logger
import config
import download_constituency_area_data
import extract_data_from_xls
import geo_naming
import combine_json

sh.mkdir('-p', config.DIR_DATA_PREFIX)

logger.info('Start data preparation')

logger.info('Start to download data')
download_constituency_area_data.main()

logger.info('Start to extract data from xls to JSON')
extract_data_from_xls.main()

logger.info('Generate unified geo-naming information')
geo_naming.main()

logger.info('Combine JSONs to single CSV')
combine_json.main()
