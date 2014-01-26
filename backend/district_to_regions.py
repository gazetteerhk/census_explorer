#>>> d = dict(zip(english.keys(), ['R'] * 22))
#>>> pprint.pprint(d)
#{u'All Districts': 'R',
# u'Central and Western': 'R',
# u'Eastern': 'R',
# u'Hong Kong Island': 'R',
# u'Islands': 'R',
# u'Kowloon': 'R',
# u'Kowloon City': 'R',
# u'Kwai Tsing': 'R',
# u'Kwun Tong': 'R',
# u'New Territories': 'R',
# u'North': 'R',
# u'Sai Kung': 'R',
# u'Sha Tin': 'R',
# u'Sham Shui Po': 'R',
# u'Southern': 'R',
# u'Tai Po': 'R',
# u'Tsuen Wan': 'R',
# u'Tuen Mun': 'R',
# u'Wan Chai': 'R',
# u'Wong Tai Sin': 'R',
# u'Yau Tsim Mong': 'R',
# u'Yuen Long': 'R'}
#


#import pprint
#from constituency_areas import english, traditional, simplified
#pprint.pprint(dict(zip(english.keys(), ['R'] * 22)))
#pprint.pprint(dict(zip(simplified.keys(), ['R'] * 22)))
#pprint.pprint(dict(zip(traditional.keys(), ['R'] * 22)))

DISTRICT_TO_REGION_ENGLISH = {
 u'All Districts': 'The Whole Territory',
 u'Central and Western': 'Hong Kong Island',
 u'Eastern': 'Hong Kong Island',
 u'Hong Kong Island': 'Hong Kong Island',
 u'Islands': 'New Territories',
 u'Kowloon': 'Kowloon',
 u'Kowloon City': 'Kowloon',
 u'Kwai Tsing': 'New Territories',
 u'Kwun Tong': 'Kowloon',
 u'New Territories': 'New Territories',
 u'North': 'New Territories',
 u'Sai Kung': 'New Territories',
 u'Sha Tin': 'New Territories',
 u'Sham Shui Po': 'Kowloon',
 u'Southern': 'Hong Kong Island',
 u'Tai Po': 'New Territories',
 u'Tsuen Wan': 'New Territories',
 u'Tuen Mun': 'New Territories',
 u'Wan Chai': 'Hong Kong Island',
 u'Wong Tai Sin': 'Kowloon',
 u'Yau Tsim Mong': 'Kowloon',
 u'Yuen Long': 'New Territories'}

DISTRICT_TO_REGION_SIMPLIFIED = {u'\u4e1c\u533a': '香港岛', #东区
 u'\u4e2d\u897f\u533a': '香港岛', #中西区
 u'\u4e5d\u9f99': '九龙', #九龙
 u'\u4e5d\u9f99\u57ce\u533a': '九龙', #九龙城区
 u'\u5143\u6717\u533a': '新界', #元朗区
 u'\u5317\u533a': '新界', #北区
 u'\u5357\u533a': '香港岛', #南区
 u'\u5927\u57d4\u533a': '新界', #大埔区
 u'\u5c6f\u95e8\u533a': '新界', #屯门区
 u'\u6240\u6709\u5730\u533a': '全港', #所有地区
 u'\u65b0\u754c': '新界',  #新界
 u'\u6c99\u7530\u533a': '新界', #沙田区
 u'\u6cb9\u5c16\u65fa\u533a': '九龙', #油尖旺区
 u'\u6df1\u6c34\u57d7\u533a': '九龙', #深水埗区
 u'\u6e7e\u4ed4\u533a': '香港岛',  #湾仔区
 u'\u79bb\u5c9b\u533a': '新界', #离岛区
 u'\u8343\u6e7e\u533a': '新界', #荃湾区
 u'\u8475\u9752\u533a': '新界', #葵青区
 u'\u897f\u8d21\u533a': '新界', #西贡区
 u'\u89c2\u5858\u533a': '九龙', #观塘区
 u'\u9999\u6e2f\u5c9b': '香港岛', #香港岛 
 u'\u9ec4\u5927\u4ed9\u533a': '九龙'} #黄大仙区

DISTRICT_TO_REGION_TRADITIONAL = {u'\u4e2d\u897f\u5340': '香港島', #中西區
 u'\u4e5d\u9f8d': '九龍', #九龍
 u'\u4e5d\u9f8d\u57ce\u5340': '九龍', #九龍城區
 u'\u5143\u6717\u5340': '新界', #元朗區
 u'\u5317\u5340': '新界', #北區
 u'\u5357\u5340': '香港島', #南區
 u'\u5927\u57d4\u5340': '新界', #大埔區
 u'\u5c6f\u9580\u5340': '新界', #屯門區
 u'\u6240\u6709\u5730\u5340': '全港', #所有地區
 u'\u65b0\u754c': '新界', #新界
 u'\u6771\u5340': '香港島',  #東區
 u'\u6c99\u7530\u5340': '新界', #沙田區
 u'\u6cb9\u5c16\u65fa\u5340': '九龍', #油尖旺區
 u'\u6df1\u6c34\u57d7\u5340': '九龍', #深水埗區
 u'\u7063\u4ed4\u5340': '香港島', #灣仔區
 u'\u8343\u7063\u5340': '新界', #荃灣區
 u'\u8475\u9752\u5340': '新界', #葵青區
 u'\u897f\u8ca2\u5340': '新界', #西貢區
 u'\u89c0\u5858\u5340': '九龍', #觀塘區
 u'\u96e2\u5cf6\u5340': '新界', #離島區
 u'\u9999\u6e2f\u5cf6': '香港島', #香港島
 u'\u9ec3\u5927\u4ed9\u5340': '九龍'} #黃大仙區
