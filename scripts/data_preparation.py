from log import logger
import download_constituency_area_data
import extract_data_from_xls

logger.info('Start data preparation')

logger.info('Start to download data')
download_constituency_area_data.main()

logger.info('Start to extract data from xls to JSON')
extract_data_from_xls.main()
