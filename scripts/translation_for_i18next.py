import config
import sh
from os import path
import json

sh.mkdir('-p', config.DIR_TRANSLATION)

# Formst:
# [ (prefix, path), ...]
sources = [
    ('area', path.join(config.DIR_DATA_GEO_NAME, 'translation-areas.json')),
    ('district', path.join(config.DIR_DATA_GEO_NAME, 'translation-districts.json')),
    ('region', path.join(config.DIR_DATA_GEO_NAME, 'translation-regions.json')),
    ('column', path.join(config.DIR_DATA_CLEAN_JSON, 'translation-column.json')),
    ('row', path.join(config.DIR_DATA_CLEAN_JSON, 'translation-row.json')),
    ('table', path.join(config.DIR_DATA_CLEAN_JSON, 'translation-table.json')),
]

def gen_one_language(sources, lang_code, fn_output):
    d =  {}
    for (name, path) in sources:
        j = json.load(open(path))
        identifiers = j.keys()
        #print identifiers
        canonical_names = [v[lang_code] for v in j.values()]
        d[name] = dict(zip(identifiers, canonical_names))
    json.dump(d, open(fn_output, 'w'))
    return d

if __name__ == '__main__':
    gen_one_language(sources, 'E', path.join(config.DIR_TRANSLATION, 'en_US.json'))
    gen_one_language(sources, 'S', path.join(config.DIR_TRANSLATION, 'zh_CN.json'))
    gen_one_language(sources, 'T', path.join(config.DIR_TRANSLATION, 'zh_HK.json'))
    gen_one_language(sources, 'T', path.join(config.DIR_TRANSLATION, 'zh_TW.json'))
