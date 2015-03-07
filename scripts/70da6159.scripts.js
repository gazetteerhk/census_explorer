"use strict";angular.module("frontendApp",["ngTable","ngCookies","ngResource","ngSanitize","ngRoute","ngAnimate","leaflet-directive","jm.i18next","ajoslin.promise-tracker","cgBusy","angulartics","angulartics.google.analytics"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl"}).when("/about",{templateUrl:"views/about.html",controller:"AboutCtrl"}).when("/choropleth",{templateUrl:"views/choropleth.html",controller:"ChoroplethCtrl"}).when("/profiles",{templateUrl:"views/profiles.html",controller:"ProfilesCtrl"}).when("/browser",{templateUrl:"views/browser.html",controller:"BrowserCtrl"}).otherwise({redirectTo:"/"})}]).config(function(a){a.settings.ga.additionalAccountNames=["gazetteer.hk","census.code4.hk"]}).run([function(){function a(a){try{if(!a.t_done||a.t_done<0)return;var e=a.t_done;_gaq.push(["_trackEvent",c+"PageLoad",b(e),d,e])}catch(f){}}function b(a){for(var b,c=[1e3,1500,2e3,2500,3e3,3500,4e3,4500,5e3,5500,6e3,6500,7e3,7500,8e3,9e3,1e4,15e3,2e4,3e4,45e3,6e4],d=0;d<c.length;d++)if(a<c[d]){b="< "+c[d]/1e3+"s";break}return b||(b="> "+c[c.length-1]/1e3+"s"),b}i18n.init({useCookie:!1,useLocalStorage:!1,detectLngQS:"lang",fallbackLng:"en-US",ns:{namespaces:["generated_ns","human_ns"],defaultNs:"human_ns"},fallbackNS:["human_ns","generated_ns"],load:"current",resGetPath:"locale/__lng__/__ns__-translation.json",getAsync:!1}),BOOMR.init({beacon_url:"/images/beacon.gif",BW:{enabled:!1}}),BOOMR.subscribe("before_beacon",a);var c="homepage",d="Measuring pageSpeed in GA"}]),angular.module("frontendApp").filter("translate",function(){return function(a,b,c){if(!_.isUndefined(a)){var d=(b||{}).prefix;return c===!1?a:_.isUndefined(d)||_.isNull(d)?i18n.t(a,b):i18n.t(d+"."+a)}}}),angular.module("frontendApp").factory("GeoFiles",["$http","$q","$cacheFactory",function(a,b){var c={};return c.getAreas=function(){var c=b.defer();return a.get("scripts/geo/ca_polygon.topo.json",{cache:!0}).success(function(a){var b=topojson.feature(a,a.objects["ca_polygon.geo"]);c.resolve(b)}),c.promise},c.getDistricts=function(){var c=b.defer();return a.get("scripts/geo/dc_polygon.topo.json",{cache:!0}).success(function(a){var b=topojson.feature(a,a.objects["dc_polygon.geo"]);c.resolve(b)}),c.promise},c}]),angular.module("frontendApp").factory("GeoMappings",[function(){var a={};return a._data={geoTree:{hk:{a:["a01","a02","a03","a04","a05","a06","a07","a08","a09","a10","a11","a12","a13","a14","a15"],b:["b01","b02","b03","b04","b05","b06","b07","b08","b09","b10","b11"],c:["c01","c02","c03","c04","c05","c06","c07","c08","c09","c10","c11","c12","c13","c14","c15","c16","c17","c18","c19","c20","c21","c22","c23","c24","c25","c26","c27","c28","c29","c30","c31","c32","c33","c34","c35","c36","c37"],d:["d01","d02","d03","d04","d05","d06","d07","d08","d09","d10","d11","d12","d13","d14","d15","d16","d17"]},nt:{k:["k01","k02","k03","k04","k05","k06","k07","k08","k09","k10","k11","k12","k13","k14","k15","k16","k17"],l:["l01","l02","l03","l04","l05","l06","l07","l08","l09","l10","l11","l12","l13","l14","l15","l16","l17","l18","l19","l20","l21","l22","l23","l24","l25","l26","l27","l28","l29"],m:["m01","m02","m03","m04","m05","m06","m07","m08","m09","m10","m11","m12","m13","m14","m15","m16","m17","m18","m19","m20","m21","m22","m23","m24","m25","m26","m27","m28","m29","m30","m31"],n:["n01","n02","n03","n04","n05","n06","n07","n08","n09","n10","n11","n12","n13","n14","n15","n16","n17"],p:["p01","p02","p03","p04","p05","p06","p07","p08","p09","p10","p11","p12","p13","p14","p15","p16","p17","p18","p19"],q:["q01","q02","q03","q04","q05","q06","q07","q08","q09","q10","q11","q12","q13","q14","q15","q16","q17","q18","q19","q20","q21","q22","q23","q24"],r:["r01","r02","r03","r04","r05","r06","r07","r08","r09","r10","r11","r12","r13","r14","r15","r16","r17","r18","r19","r20","r21","r22","r23","r24","r25","r26","r27","r28","r29","r30","r31","r32","r33","r34","r35","r36"],s:["s01","s02","s03","s04","s05","s06","s07","s08","s09","s10","s11","s12","s13","s14","s15","s16","s17","s18","s19","s20","s21","s22","s23","s24","s25","s26","s27","s28","s29"],t:["t01","t02","t03","t04","t05","t06","t07","t08","t09","t10"]},kl:{e:["e01","e02","e03","e04","e05","e06","e07","e08","e09","e10","e11","e12","e13","e14","e15","e16","e17"],f:["f01","f02","f03","f04","f05","f06","f07","f08","f09","f10","f11","f12","f13","f14","f15","f16","f17","f18","f19","f20","f21"],g:["g01","g02","g03","g04","g05","g06","g07","g08","g09","g10","g11","g12","g13","g14","g15","g16","g17","g18","g19","g20","g21","g22"],h:["h01","h02","h03","h04","h05","h06","h07","h08","h09","h10","h11","h12","h13","h14","h15","h16","h17","h18","h19","h20","h21","h22","h23","h24","h25"],j:["j01","j02","j03","j04","j05","j06","j07","j08","j09","j10","j11","j12","j13","j14","j15","j16","j17","j18","j19","j20","j21","j22","j23","j24","j25","j26","j27","j28","j29","j30","j31","j32","j33","j34","j35"]}},districts:["a","b","c","d","e","f","g","h","j","k","l","m","n","p","q","r","s","t"],regions:["hk","kl","nt"]},a._data.areas=_.sortBy(_.flatten(_.map(_.values(a._data.geoTree),_.values))),a.getDistrictsFromRegion=function(b){if(b=b.toLowerCase(),_.isUndefined(a._data.geoTree[b]))throw String(b)+" is not a valid region";return _.keys(a._data.geoTree[b])},a.getRegionFromDistrict=function(b){var c;b=b.toLowerCase();for(var d=0;d<a._data.regions.length;d++)if(c=a._data.regions[d],_.contains(_.keys(a._data.geoTree[c]),b))return c;throw String(b)+" is not a valid district"},a.getDistrictFromArea=function(b){var c=b.toLowerCase().charAt(0);if(_.contains(a._data.districts,c))return c;throw String(c)+" is not a valid district"},a.getAreasFromDistrict=function(b){b=b.toLowerCase();var c=a.getRegionFromDistrict(b);return a._data.geoTree[c][b]},a.getAllAreas=function(){return a._data.areas},a.getAllDistricts=function(){return a._data.districts},a}]),angular.module("frontendApp").factory("AreaSelection",["GeoMappings",function(a){var b=0,c=1,d=2,e={},f=function(){this._selected={}};f.prototype.selectedAreas=function(){return _.sortBy(_.keys(this._selected))};var g=function(e){return e=e.toLowerCase(),_.contains(a._data.regions,e)?d:_.contains(a._data.districts,e)?c:b},h=function(b,e){e=e.toLowerCase();var f=g(e);if(f===d)j(b,e);else if(f===c)i(b,e);else{var h=a.getAllAreas();if(_.has(b._selected,e))return;if(!(_.indexOf(h,e,!0)>-1))throw String(e)+" is not a valid area";b._selected[e]=!0}},i=function(b,c){c=c.toLowerCase();var d=a.getAreasFromDistrict(c);_.forEach(d,function(a){b._selected[a]=!0})},j=function(b,c){c=c.toLowerCase();var d=a.getDistrictsFromRegion(c);_.forEach(d,_.partial(i,b))};f.prototype.addArea=function(a){_.isArray(a)?_.forEach(a,_.partial(h,this)):h(this,a)},f.prototype.clearSelected=function(){var a=this;_.forOwn(this._selected,function(b,c){delete a._selected[c]})};var k=function(a,b){b=b.toLowerCase();var e=g(b);e===d?l(a,b):e===c?m(a,b):delete a._selected[b]},l=function(b,c){c=c.toLowerCase();var d=a.getDistrictsFromRegion(c);_.forEach(d,_.partial(m,b))},m=function(b,c){c=c.toLowerCase();var d=a.getAreasFromDistrict(c);_.forEach(d,function(a){delete b._selected[a]})};return f.prototype.removeArea=function(a){_.isArray(a)?_.forEach(a,_.partial(k,this)):k(this,a)},f.prototype.isSelected=function(b){var e=this;b=b.toLowerCase();var f=g(b);if(f===d){var h=_.flatten(_.map(a.getDistrictsFromRegion(b)),function(b){return a.getAreasFromDistrict(b)});return _.every(_.map(h,function(a){return _.has(e._selected,a)}))}if(f===c){var h=a.getAreasFromDistrict(b);return _.every(_.map(h,function(a){return _.has(e._selected,a)}))}return _.has(e._selected,b)},f.prototype.hasSelection=function(){return _.keys(this._selected).length>0},e.AreaModel=f,e.getModel=function(){return new f},e}]),angular.module("frontendApp").factory("CensusAPI",["$log","$http","$q",function(a,b,c){var d={};d.endpointURL="http://128.199.138.207:8080/api/",d._baseFilters={area:{},table:{},column:{},row:{},projector:{},"return":{},groupby:{},aggregate:{},region:{},district:{},skip:{},count:{}},d.joinData=function(a){for(var b,c=_.values(a)[0].length,d=[],e=_.keys(a),f=0;c>f;f++)b={},_.forEach(e,function(c){b[c]=a[c][f]}),d.push(b);return d},d.joinGroups=function(a,b){if(_.isString(b)){var c=[];return _.forOwn(a,function(a,e){var f=d.joinData(a);_.forEach(f,function(a){a[b]=e}),c.push(f)}),_.flatten(c)}return _.flatten(_.map(_.values(a),d.joinData))},d.sumBy=function(a,b){_.isString(b)&&(b=[b]);var c={};return _.forEach(a,function(a){var d=_.map(b,function(b){return a[b]}).join(",");_.has(c,d)||(c[d]=0),c[d]+=a.value}),c},d.asPercentage=function(a,b){_.isString(b)&&(b=[b]);var c=d.sumBy(a,b),e=[];return _.map(a,function(a){var d=_.map(b,function(b){return a[b]}).join(","),f=_.clone(a,!0);f.value=0===c[d]?0:f.value/c[d],e.push(f)}),e};var e=function(a){this._filters=_.clone(d._baseFilters,!0),_.isUndefined(a)||this.addParam(a)},f=function(a){var b=_.keys(d._baseFilters);if(-1===_.indexOf(b,a))throw'[CensusAPI]: "'+String(a)+'" is not a valid parameter'};e.prototype._addSingleParam=function(a,b){f(a),_.isArray(b)?_.forEach(b,function(b){this._filters[a][b]=!0},this):_.isPlainObject(b)?_.forEach(_.keys(b),function(b){this._filters[a][b]=!0},this):this._filters[a][b]=!0},e.prototype.addParam=function(a,b){_.isPlainObject(a)?_.forOwn(a,function(a,b){this._addSingleParam.apply(this,[b,a])},this):this._addSingleParam(a,b)};var g=function(a){var b=_.omit(a,function(a){return _.isEmpty(a)});return _.mapValues(b,function(a){return _.keys(a).join(",")})};return e.prototype.fetch=function(){var a=c.defer();return b.get(d.endpointURL,{params:g(this._filters),cache:!0,tracker:"globalTracker"}).then(function(b){a.resolve(b.data)}),a.promise},e.prototype.clone=function(){return new e(this._filters)},d.Query=e,d}]),angular.module("frontendApp").factory("Indicators",[function(){var a={},b={};b.ageGroup=["h7_0","h8_5","h9_10","h10_15","h11_20","h12_25","h13_30","h14_35","h15_40","h16_45","h17_50","h18_55","h19_60","h20_65","h21_70","h22_75","h23_80","h24_85"],b.income=["a102_unpaid","a78_<","a80_2000","a82_4000","a84_6000","a86_8000","a88_10000","a90_15000","a92_20000","a94_25000","a96_30000","a98_40000","a100_>="],a.ordering=b;var c={};return c.areaMedianModifier={groupby:"area",aggregate:"median",projector:["value","row"],"return":["groups","options"]},c.areaModeModifier={groupby:"area",aggregate:"max",projector:["value","row"],"return":["groups","options"]},c.ethnicity={table:0,column:"tab0_both",projector:["area","value","row"],"return":["data","options"]},c.maritalStatus={table:2,column:"e28_both",projector:["area","value","row"],"return":["data","options"]},c.maritalStatusMale={table:2,column:"c28_male",projector:["area","value","row"],"return":["data","options"]},c.maritalStatusFemale={table:2,column:"d28_female",projector:["area","value","row"],"return":["data","options"]},c.educationalAttainment={table:3,column:"e43_total",projector:["area","value","row"],"return":["data","options"]},c.economicStatus={table:4,column:"e61_both",projector:["area","value","row"],"return":["data","options"]},c.economicStatusMale={table:4,column:"c61_male",projector:["area","value","row"],"return":["data","options"]},c.economicStatusFemale={table:4,column:"d61_female",projector:["area","value","row"],"return":["data","options"]},c.monthlyIncome={table:5,column:"e77_both",projector:["area","value","row"],"return":["data","options"]},c.monthlyIncomeMale={table:5,column:"c77_male",projector:["area","value","row"],"return":["data","options"]},c.monthlyIncomeFemale={table:5,column:"d77_female",projector:["area","value","row"],"return":["data","options"]},c.householdComposition={table:6,projector:["area","value","row"],"return":["data","options"]},c.householdSize={table:7,projector:["area","value","row"],"return":["data","options"]},c.householdHousingType={table:8,column:"d146_households",projector:["area","value","row"],"return":["data","options"]},c.housingTenure={table:9,projector:["area","value","row"],"return":["data","options"]},c.individualHousingType={table:10,column:"e168_both",projector:["area","value","row"],"return":["data","options"]},c.individualHousingTypeMale={table:10,column:"c168_male",projector:["area","value","row"],"return":["data","options"]},c.individualHousingTypeFemale={table:10,column:"d168_female",projector:["area","value","row"],"return":["data","options"]},c.migration={table:11,projector:["area","value","row"],"return":["data","options"]},c.age={table:12,column:"n6_both",projector:["area","value","row"],"return":["data","options"]},c.ageMale={table:12,column:"l6_male",projector:["area","value","row"],"return":["data","options"]},c.ageFemale={table:12,column:"m6_female",projector:["area","value","row"],"return":["data","options"]},c.placeOfStudy={table:14,projector:["area","value","row"],"return":["data","options"]},c.placeOfWork={table:15,column:"n61_both",projector:["area","value","row"],"return":["data","options"]},c.placeOfWorkMale={table:15,column:"l61_male",projector:["area","value","row"],"return":["data","options"]},c.placeOfWorkFemale={table:15,column:"m61_female",projector:["area","value","row"],"return":["data","options"]},c.occupation={table:16,column:"n81_both",projector:["area","value","row"],"return":["data","options"]},c.occupationMale={table:16,column:"l81_male",projector:["area","value","row"],"return":["data","options"]},c.occupationFemale={table:16,column:"m81_female",projector:["area","value","row"],"return":["data","options"]},c.industry={table:17,column:"n95_both",projector:["area","value","row"],"return":["data","options"]},c.industryMale={table:17,column:"l95_male",projector:["area","value","row"],"return":["data","options"]},c.industryFemale={table:17,column:"m95_female",projector:["area","value","row"],"return":["data","options"]},c.householdIncome={table:18,column:"n118_households",projector:["area","value","row"],"return":["data","options"]},c.householdMortgage={table:19,projector:["area","value","row"],"return":["data","options"]},c.householdRent={table:20,projector:["area","value","row"],"return":["data","options"]},a.queries=c,a}]),angular.module("frontendApp").directive("hkMap",function(){return{scope:!0,restrict:"AE",priority:10,compile:function(a,b){var c=angular.element(a.children()[0]);c.css("height",b.height||"300px"),a.css("position","relative"),_.isUndefined(b.mapId)||c.attr("id",b.mapId)},controller:["$scope","GeoFiles","$attrs","AreaSelection","$parse","leafletData",function(a,b,c,d,e,f){a.defaults={scrollWheelZoom:!0,maxZoom:18},a.layers={baselayers:{googleRoadMap:{name:"Google Streets",layerType:"ROADMAP",type:"google"}}},a._singleSelect=_.has(c,"singleSelect");var g=14;a.center=_.isUndefined(c.mapCenter)?{}:e(c.mapCenter)(a),_.isEmpty(a.center)&&angular.extend(a.center,{lat:22.298,lng:114.151,zoom:12}),a.getMap=function(){return _.isUndefined(c.mapId)?f.getMap():f.getMap(c.mapId)},a._defaultStyle={color:"#2b8cbe",fillOpacity:0,weight:3},a._hoverStyle={color:"#000",fillColor:"#2b8cbe",fillOpacity:.2,weight:6},a._partiallySelectedStyle={color:"#ff0",fillColor:"#ff0",fillOpacity:.2,weight:6},a._selectedStyle={color:"#2ca25f",fillColor:"#2ca25f",fillOpacity:.2,weight:6};var h=function(b){var c=b.properties.CODE;return a.selectedAreas.isSelected(c)?a._selectedStyle:a._defaultStyle};a.selectedAreas=_.isUndefined(c.selectedAreas)?d.getModel():e(c.selectedAreas)(a);var i=function(a){var b=_.values(a._layers);_.forEach(b,function(a){_.isUndefined(a.feature)||_.isUndefined(a.feature.properties)||a.setStyle(h(a.feature))})},j=function(){a.getMap().then(function(a){i(a)})};a.$on("redrawMap",function(){console.log("redrawing map"),j()});var k=function(a){return!_.isUndefined(a.properties.CA)},l=function(b){var c=b.target,d=n(b);a.selectedAreas.isSelected(d)||(c.setStyle(a._hoverStyle),L.Browser.ie||L.Browser.opera||c.bringToFront());var e=k(b.target.feature)?"area.":"district.";a.hoveredFeature=e+d.toLowerCase()},m=function(b){var c=b.target,d=n(b);a.selectedAreas.isSelected(d)||c.setStyle(a._defaultStyle),a.hoveredFeature=void 0},n=function(a){return a.target.feature.properties.CODE},o=function(b){var c=n(b);a._singleSelect===!0&&(a.selectedAreas.clearSelected(),j()),a.selectedAreas.isSelected(c)?(b.target.setStyle(a._hoverStyle),a.selectedAreas.removeArea(c)):(b.target.setStyle(a._selectedStyle),a.selectedAreas.addArea(c))},p=function(a,b){b.on({mouseover:l,mouseout:m,click:o})};b.getDistricts().then(function(b){a.districts={data:b,style:h,onEachFeature:p},a.geojson=a.districts}),b.getAreas().then(function(b){a.areas={data:b,style:h,onEachFeature:p}}),a.$watch("center.zoom",function(b){a.geojson=b>=g?a.areas:a.districts})}],template:'<leaflet center="center" defaults="defaults" geojson="geojson" layers="layers"></leaflet><div class="map-overlay" ng-show="hoveredFeature">{{ hoveredFeature | translate }}</div>'}}),angular.module("frontendApp").directive("hkChoropleth",function(){return{scope:!0,restrict:"AE",priority:10,compile:function(a,b){var c=angular.element(a.children()[0]);c.css("height",b.height||"300px"),a.css("position","relative"),_.isUndefined(b.mapId)||c.attr("id",b.mapId)},controller:["$scope","GeoFiles","$attrs","AreaSelection","$parse","leafletData",function(a,b,c,d,e,f){a.defaults={scrollWheelZoom:!0,maxZoom:18},a.layers={baselayers:{googleRoadMap:{name:"Google Streets",layerType:"ROADMAP",type:"google"}}};var g={colors:colorbrewer.Reds[5],scale:null,valueVar:"value",style:{fillOpacity:.5}},h=.5;a.center=_.isUndefined(c.mapCenter)?{}:e(c.mapCenter)(a),_.isEmpty(a.center)&&angular.extend(a.center,{lat:22.298,lng:114.151,zoom:12}),a.getMap=function(){return _.isUndefined(c.mapId)?f.getMap():f.getMap(c.mapId)},a._getValueFromArea=function(b){return _.isUndefined(b)||_.isUndefined(a._mapDataHash)?void 0:(b=b.toLowerCase(),a._mapDataHash[b])};var i=e(c.mapData),j=function(){return a._mapData=i(a),a._mapData};a.$watch(j,function(b){_.isUndefined(b)||(l(),k(),m(),n(),a.getMap().then(function(a){p(a)}))});var k=function(){a._mapDataHash={},_.forEach(a._mapData,function(b){a._mapDataHash[b.area]=b[a._mapConfig.valueVar]})},l=function(){var b=_.clone(g);if(!_.isUndefined(c.mapConfig)){var d=e(c.mapConfig);_.assign(b,d(a))}a._mapConfig=b},m=function(){if(null===a._mapConfig.scale){var b=_.sortBy(_.pluck(a._mapData,a._mapConfig.valueVar));a._colorScale=d3.scale.quantize().domain(b).range(d3.range(5))}else a._colorScale=a._mapConfig.scale;a._colors=a._mapConfig.colors},n=function(){var b=d3.select(".map-legend"),c=d3.format("0f");b.selectAll("ul").remove();var d=b.append("ul"),e=d.selectAll("li.key").data(a._colorScale.range());if(e.enter().append("li").attr("class","key"),e.append("span").attr("class","key-symbol").style("background-color",function(b){return a._colors[b]}).style("opacity",h),_.isUndefined(a._colorScale.invertExtent))var f=function(b){return i18n.t(a._mapConfig.valueVar+"."+a._colorScale.domain()[b])};else var f=function(b){var d=a._colorScale.invertExtent(b);return c(d[0])+" - "+c(d[1])};e.append("span").attr("class","key-label").text(f)};a._defaultStyle={color:"#2b8cbe",fillOpacity:0,weight:0};var o=function(b){var c=b.properties.CODE,d=_.clone(a._defaultStyle);return _.isUndefined(a._mapConfig.style)||_.extend(d,a._mapConfig.style),d.fillColor=a._colors[a._colorScale(a._getValueFromArea(c))],d},p=function(a){var b=_.values(a._layers);_.forEach(b,function(a){_.isUndefined(a.feature)||_.isUndefined(a.feature.properties)||a.setStyle(o(a.feature))})},q=function(a){return!_.isUndefined(a.properties.CA)},r=function(b){var c=b.target,d=t(b);c.setStyle({weight:3}),L.Browser.ie||L.Browser.opera||c.bringToFront();var e=q(b.target.feature)?"area.":"district.";if(a.hoveredFeature=e+d.toLowerCase(),!_.isUndefined(a._mapConfig))if(_.isUndefined(a._colorScale.invertExtent))a.hoveredFeatureValue=i18n.t(a._mapConfig.valueVar+"."+a._getValueFromArea(d.toLowerCase()));else{var f=d3.format("0f");a.hoveredFeatureValue=f(a._getValueFromArea(d.toLowerCase()))}},s=function(b){{var c=b.target;t(b)}c.setStyle({weight:0}),a.hoveredFeature=void 0,a.hoveredFeatureCode=void 0},t=function(a){return a.target.feature.properties.CODE},u=function(a,b){b.on({mouseover:r,mouseout:s})},v=e(c.mapLevel),w=function(){return a._mapLevel=v(a),a.mapLevel};a.$watch(w,function(c){"dc"==c?b.getDistricts().then(function(b){a.geojson={data:b,style:a._defaultStyle,onEachFeature:u}}):b.getAreas().then(function(b){a.geojson={data:b,style:a._defaultStyle,onEachFeature:u}})}),a.$on("redrawMap",function(){a.getMap().then(function(a){p(a)})})}],template:'<leaflet center="center" defaults="defaults" geojson="geojson" layers="layers"></leaflet><div class="map-overlay" ng-show="hoveredFeature">{{ hoveredFeature | translate }} - {{ hoveredFeatureValue }}</div><div class="map-legend"></div>'}}),angular.module("frontendApp").controller("MainCtrl",["$scope",function(){}]),angular.module("frontendApp").controller("AboutCtrl",["$scope",function(){}]),angular.module("frontendApp").controller("MapCtrl",["$scope","$http","GeoFiles","AreaSelection",function(a,b,c,d){a.selection=d.getModel(),a.clearAndRedraw=function(){a.selection.clearSelected(),a.$broadcast("redrawMap")}}]),angular.module("frontendApp").controller("ChoroplethCtrl",["$scope","CensusAPI","Indicators","$filter","$analytics",function(a,b,c,d,e){a.refresh=function(){BOOMR.plugins.RT.startTimer("t_done");{var c=(new Date).getTime(),d=new b.Query(a.selectedIndicator.params);d.fetch().then(function(b){var d=a.selectedIndicator.parser(b);a.mapConfig=a.selectedIndicator.config,a.areaData=d,BOOMR.plugins.RT.done(),e.eventTrack("loadChoropleth",{timing:!0,category:"interactionSpeed",value:(new Date).getTime()-c,label:a.selectedIndicator.displayedName})})}};var f={table:12,column:["l6_male","m6_female"],projector:["area","value","row","column"],"return":["data","options"]},g=function(a){var c=b.sumBy(b.joinData(a.data),["area","column"]);console.log(c);var d={},e={};_.forOwn(c,function(a,b){var c=b.split(",");"l6_male"===c[1]?d[c[0]]=a:"m6_female"===c[1]&&(e[c[0]]=a)}),console.log(d),console.log(e);var f=[];return _.forOwn(d,function(a,b){f.push({area:b,value:a/e[b]*1e3})}),console.log(f),f},h=function(a){return function(c){var d=b.joinGroups(c.groups,"area"),e=d3.scale.ordinal().domain(c.options.row).range(d3.range(c.options.row.length));return a.scale=e,d}},i=_.clone(colorbrewer.Reds[7]).reverse().concat(colorbrewer.Greens[7]),j={colors:i,valueVar:"row"},k={colors:colorbrewer.Blues[6],valueVar:"row"},l={colors:_.clone(colorbrewer.Reds[9]).reverse().concat(colorbrewer.Greens[9]),valueVar:"row"},m={colors:colorbrewer.Greens[7],valueVar:"row"},n={colors:colorbrewer.Paired[9],valueVar:"row"},o={colors:colorbrewer.Paired[11],valueVar:"row"},p={valueVar:"value"},q=function(a){return function(c){var d=b.asPercentage(b.joinData(c.data),"area"),e={},f=a;_.forEach(d,function(a){_.contains(f,a.row)&&(_.isUndefined(e[a.area])&&(e[a.area]=0),e[a.area]+=a.value)});var g=[];return _.forOwn(e,function(a,b){g.push({area:b,value:100*a})}),g}};a.indicators=[{name:"mapper.options.male_to_female_ratio",params:f,config:p,parser:g},{name:"mapper.options.median_age",params:_.extend(_.clone(c.queries.age,!0),c.queries.areaMedianModifier),config:l,parser:h(l)},{name:"mapper.options.percent_population_under_15",params:c.queries.age,config:p,parser:q(["h7_0","h8_5","h9_10"])},{name:"mapper.options.percent_population_over_65",params:c.queries.age,config:p,parser:q(["h20_65","h21_70","h22_75","h23_80","h24_85"])},{name:"mapper.options.percent_population_non_chinese",params:c.queries.ethnicity,config:p,parser:q(["tab0_indonesian","tab0_white","tab0_others","tab0_filipino","tab0_korean","tab0_indian","tab0_japanese","tab0_pakistani","tab0_thai","tab0_nepalese","tab0_black","tab0_sri-lankan","tab0_vietnamese"])},{name:"mapper.options.percent_population_indo_filipino",params:c.queries.ethnicity,config:p,parser:q(["tab0_filipino","tab0_indonesian"])},{name:"mapper.options.population_divorced_separated",params:c.queries.maritalStatus,config:p,parser:q(["a32_divorced","a33_separated"])},{name:"mapper.options.median_household",params:_.extend(_.clone(c.queries.householdSize,!0),c.queries.areaMedianModifier),config:k,parser:h(k)},{name:"mapper.options.percent_households_public_rental",params:_.clone(c.queries.householdHousingType),config:p,parser:q(["a147_public"])},{name:"mapper.options.percent_households_own",params:c.queries.housingTenure,config:p,parser:q(["a156_with","a157_without"])},{name:"mapper.options.percent_households_rent",params:c.queries.housingTenure,config:p,parser:q(["a158_sole","a159_co-tenantmain"])},{name:"mapper.options.median_monthly_rent",params:_.extend(_.clone(c.queries.householdRent,!0),c.queries.areaMedianModifier),config:j,parser:h(j)},{name:"mapper.options.median_monthly_mortgage",params:_.extend(_.clone(c.queries.householdMortgage,!0),c.queries.areaMedianModifier),config:j,parser:h(j)},{name:"mapper.options.most_common_edu",params:_.extend(_.clone(c.queries.educationalAttainment,!0),c.queries.areaModeModifier),config:m,parser:h(m)},{name:"mapper.options.percent_population_edu_post_sec",params:c.queries.educationalAttainment,config:p,parser:q(["a51_diplomacertificate","a52_sub-degree","a53_degree"])},{name:"mapper.options.percent_population_edu_students_travel",params:c.queries.placeOfStudy,config:p,parser:q(["h44_hong","h45_kowloon","h46_new","h47_other"])},{name:"mapper.options.median_monthly_household_income",params:_.extend(_.clone(c.queries.householdIncome,!0),c.queries.areaMedianModifier),config:j,parser:h(j)},{name:"mapper.options.percent_household_lower_income",params:c.queries.householdIncome,config:p,parser:q(["h119_<","h120_2000","h121_4000","h122_6000","h123_8000","h124_10000","h125_15000","h126_20000"])},{name:"mapper.options.most_common_monthly_income",params:_.extend(_.clone(c.queries.householdIncome,!0),c.queries.areaModeModifier),config:j,parser:h(j)},{name:"mapper.options.most_common_occupation_men",params:_.extend(_.clone(c.queries.occupationMale,!0),c.queries.areaModeModifier),config:n,parser:h(n)},{name:"mapper.options.most_common_occupation_women",params:_.extend(_.clone(c.queries.occupationFemale,!0),c.queries.areaModeModifier),config:n,parser:h(n)},{name:"mapper.options.most_common_industry_men",params:_.extend(_.clone(c.queries.industryMale,!0),c.queries.areaModeModifier),config:o,parser:h(o)},{name:"mapper.options.most_common_industry_women",params:_.extend(_.clone(c.queries.industryFemale,!0),c.queries.areaModeModifier),config:o,parser:h(o)},{name:"mapper.options.percent_workers_travel",params:c.queries.placeOfWork,config:p,parser:q(["h64_hong","h65_kowloon","h66_new","h67_other","h68_no","h70_places"])},{name:"mapper.options.residence_stability",params:c.queries.migration,config:p,parser:q(["a191_moved","a192_remained"])}];var r=d("translate");angular.forEach(a.indicators,function(a){a.displayedName=r(a.name),console.log(a.displayedName)}),a.mapLevel="ca",a.theData=a.areaData}]),angular.module("frontendApp").controller("BrowserCtrl",["$scope","CensusAPI","ngTableParams",function(a,b,c){a.showCodes=!1;var d={skip:0,count:5};a.model=_.clone(d),a.options={},a.refresh=function(){var d=new b.Query(a.model);d.addParam("return","options,data"),d.addParam("projector","region,district,area,table,row,column,value"),d.fetch().then(function(d){a.options=d.options,a.options.area=_.sortBy(a.options.area),a.options.district=_.sortBy(a.options.district),a.meta=d.meta,a.data=b.joinData(d.data),a.tableParams=new c({page:1,count:5},{total:d.meta.length,getData:function(c,d){a.model.skip=(d.page()-1)*d.count(),a.model.count=d.count();var e=new b.Query(a.model);e.addParam("return","options,data"),e.addParam("projector","region,district,area,table,row,column,value"),e.addParam("skip",a.model.skip),e.addParam("count",a.model.count),e.fetch().then(function(d){a.data=b.joinData(d.data),c.resolve(a.data)})}}),a.tableParams.page(1)})},a.clear=function(b){_.isUndefined(b)?a.model=_.clone(d):delete a.model[b],a.refresh()},a.refresh()}]),angular.module("frontendApp").controller("ProfilesCtrl",["$scope","AreaSelection","CensusAPI","Indicators","$timeout",function(a,b,c,d,e){a.selection=b.getModel(),a._charts={};var f={column:["l6_male","m6_female","tab0_male","tab0_female","e18_both","l81_male","m81_female","l95_male","m95_female","c77_male","d77_female"],projector:["value","row","column"],"return":["data","options"]};a.$watch("selection",function(){if(0!=a.selection.selectedAreas().length){var b=new c.Query(f),d=a.selection.selectedAreas();if(d.length>1){var g=d[0][0];a.selectionName=i18n.t("district."+g)}else a.selectionName=i18n.t("area."+d[0]);b.addParam("area",d),e(function(){b.fetch().then(function(b){a._rawResponse=b,a._queryData=c.joinData(b.data),a.redrawCharts()})},300),e(function(){$("body").animate({scrollTop:$("#profile-charts").offset().top},"slow")},100)}},!0),a.redrawCharts=function(){a._drawAge(),a._drawEthnicity(),a._drawLanguage(),a._drawOccupation(),a._drawIndustry(),a._drawIncome()};var g=function(b){_.isUndefined(a._charts[b])||a._charts[b].svg.remove()},h=function(b,c,d){a._charts[b]={svg:c,chart:d}};a._drawAge=function(){var b="#profile-age";g(b);var e=["l6_male","m6_female"],f=_.filter(a._queryData,function(a){return e.indexOf(a.column)>-1}),i=c.sumBy(f,["row","column"]),j=[];_.forOwn(i,function(a,b){var c=b.split(",");j.push({"Age Group":i18n.t("row."+c[0]),Gender:i18n.t("column."+c[1]),Population:"l6_male"===c[1]?-1*a:a})});var k=dimple.newSvg(b,angular.element(b).width()+10,300),l=new dimple.chart(k,j);l.setBounds("13%",0,"85%","85%"),l.addMeasureAxis("x","Population");var m=l.addCategoryAxis("y","Age Group");m.addOrderRule(_.map(d.ordering.ageGroup,function(a){return i18n.t("row."+a)}),!0),l.addSeries("Gender",dimple.plot.bar),l.addLegend("75%","77%","30%","10%"),l.draw(1e3),h(b,k,l)},a._drawEthnicity=function(){var b="#profile-ethnicity";g(b);var d=["tab0_male","tab0_female"],e=_.filter(a._queryData,function(a){return d.indexOf(a.column)>-1}),f=c.sumBy(e,["row","column"]),i=[];_.forOwn(f,function(a,b){var c=b.split(",");i.push({Ethnicity:i18n.t("row."+c[0]),Gender:i18n.t("column."+c[1]),Population:a})});var j=dimple.newSvg(b,void 0,300),k=new dimple.chart(j,i);k.setBounds(65,15,"70%","81%"),k.addCategoryAxis("x",["Gender"]),k.addPctAxis("y","Population"),k.addSeries("Ethnicity",dimple.plot.bar),k.draw(1e3),h(b,j,k)},a._drawLanguage=function(){var b="#profile-language";g(b);var d=_.filter(a._queryData,function(a){return"e18_both"===a.column}),e=c.sumBy(d,["row"]),f=[];_.forOwn(e,function(a,b){f.push({Language:i18n.t("row."+b),"All people":"",Population:a})});var i=dimple.newSvg(b,void 0,300),j=new dimple.chart(i,f);j.setBounds(65,15,"70%","81%"),j.addCategoryAxis("x","All People"),j.addPctAxis("y","Population"),j.addSeries("Language",dimple.plot.bar),j.draw(1e3),h(b,i,j)},a._drawOccupation=function(){var b="#profile-occupation";g(b);var d=["l81_male","m81_female"],e=_.filter(a._queryData,function(a){return d.indexOf(a.column)>-1}),f=c.sumBy(e,["row","column"]),i=[];_.forOwn(f,function(a,b){var c=b.split(",");i.push({Occupation:i18n.t("row."+c[0]),Gender:i18n.t("column."+c[1]),Population:a})});var j=dimple.newSvg(b,angular.element(b).width()+10,150),k=new dimple.chart(j,i);k.setBounds(65,10,490,90),k.addCategoryAxis("y","Gender"),k.addPctAxis("x","Population"),k.addSeries("Occupation",dimple.plot.bar),k.draw(1e3),h(b,j,k)},a._drawIndustry=function(){var b="#profile-industry";g(b);var d=["l95_male","m95_female"],e=_.filter(a._queryData,function(a){return d.indexOf(a.column)>-1}),f=c.sumBy(e,["row","column"]),i=[];_.forOwn(f,function(a,b){var c=b.split(",");i.push({Industry:i18n.t("row."+c[0]),Gender:i18n.t("column."+c[1]),Population:a})});var j=dimple.newSvg(b,angular.element(b).width()+10,150),k=new dimple.chart(j,i);k.setBounds(65,10,490,90),k.addCategoryAxis("y","Gender"),k.addPctAxis("x","Population"),k.addSeries("Industry",dimple.plot.bar),k.draw(1e3),h(b,j,k)},a._drawIncome=function(){var b="#profile-income";g(b);var e=["c77_male","d77_female"],f=_.filter(a._queryData,function(a){return e.indexOf(a.column)>-1
}),i=c.sumBy(f,["row","column"]),j=[];_.forOwn(i,function(a,b){var c=b.split(",");j.push({Income:i18n.t("row."+c[0]),Gender:i18n.t("column."+c[1]),Population:"c77_male"===c[1]?-1*a:a})});var k=dimple.newSvg(b,angular.element(b).width()+10,350),l=new dimple.chart(k,j);l.setBounds(120,0,400,"85%"),l.addMeasureAxis("x","Population");var m=l.addCategoryAxis("y","Income");m.addOrderRule(_.map(d.ordering.income,function(a){return i18n.t("row."+a)}),!0),l.addSeries("Gender",dimple.plot.bar),l.addLegend("75%",10,"30%","10%"),l.draw(1e3),h(b,k,l)}}]);