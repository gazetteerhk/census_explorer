import sh

from log import logger
import config
import download_constituency_area_data
import extract_data_from_xls
import geo_naming
import combine_json
import public_facilities
import translation_for_i18next

print(config.DIR_DATA_PREFIX)
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

logger.info('Appending public facility data')
public_facilities.main()

# Data preparation pipeline is for general purpose.
# The following generates translation maps for our frontend use,
# and the output is under version control.
# So it is removed from the pipeline.
# 
# Translation maintainer should manually execute it and commit new files.
#
#logger.info('Convert translation dicts to i18next format')
#translation_for_i18next.main()
