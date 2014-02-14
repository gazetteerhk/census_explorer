'use strict';

/*
 * Mappings for referencing between regions, districts, and areas.
 * Basically a set of metadata
 */

angular.module('frontendApp').factory('GeoMappings', [function() {
  var svc = {};
  svc._data = {
    geoTree: {
      hk: {
        a: ['a01', 'a02', 'a03', 'a04', 'a05', 'a06', 'a07', 'a08', 'a09', 'a10', 'a11', 'a12', 'a13', 'a14', 'a15'],
        b: ['b01', 'b02', 'b03', 'b04', 'b05', 'b06', 'b07', 'b08', 'b09', 'b10', 'b11'],
        c: ['c01', 'c02', 'c03', 'c04', 'c05', 'c06', 'c07', 'c08', 'c09', 'c10', 'c11', 'c12', 'c13', 'c14', 'c15', 'c16', 'c17', 'c18', 'c19', 'c20', 'c21', 'c22', 'c23', 'c24', 'c25', 'c26', 'c27', 'c28', 'c29', 'c30', 'c31', 'c32', 'c33', 'c34', 'c35', 'c36', 'c37'],
        d: ['d01', 'd02', 'd03', 'd04', 'd05', 'd06', 'd07', 'd08', 'd09', 'd10', 'd11', 'd12', 'd13', 'd14', 'd15', 'd16', 'd17']
      },
      nt: {
        k: ['k01', 'k02', 'k03', 'k04', 'k05', 'k06', 'k07', 'k08', 'k09', 'k10', 'k11', 'k12', 'k13', 'k14', 'k15', 'k16', 'k17'],
        l: ['l01', 'l02', 'l03', 'l04', 'l05', 'l06', 'l07', 'l08', 'l09', 'l10', 'l11', 'l12', 'l13', 'l14', 'l15', 'l16', 'l17', 'l18', 'l19', 'l20', 'l21', 'l22', 'l23', 'l24', 'l25', 'l26', 'l27', 'l28', 'l29'],
        m: ['m01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08', 'm09', 'm10', 'm11', 'm12', 'm13', 'm14', 'm15', 'm16', 'm17', 'm18', 'm19', 'm20', 'm21', 'm22', 'm23', 'm24', 'm25', 'm26', 'm27', 'm28', 'm29', 'm30', 'm31'],
        n: ['n01', 'n02', 'n03', 'n04', 'n05', 'n06', 'n07', 'n08', 'n09', 'n10', 'n11', 'n12', 'n13', 'n14', 'n15', 'n16', 'n17'],
        p: ['p01', 'p02', 'p03', 'p04', 'p05', 'p06', 'p07', 'p08', 'p09', 'p10', 'p11', 'p12', 'p13', 'p14', 'p15', 'p16', 'p17', 'p18', 'p19'],
        q: ['q01', 'q02', 'q03', 'q04', 'q05', 'q06', 'q07', 'q08', 'q09', 'q10', 'q11', 'q12', 'q13', 'q14', 'q15', 'q16', 'q17', 'q18', 'q19', 'q20', 'q21', 'q22', 'q23', 'q24'],
        r: ['r01', 'r02', 'r03', 'r04', 'r05', 'r06', 'r07', 'r08', 'r09', 'r10', 'r11', 'r12', 'r13', 'r14', 'r15', 'r16', 'r17', 'r18', 'r19', 'r20', 'r21', 'r22', 'r23', 'r24', 'r25', 'r26', 'r27', 'r28', 'r29', 'r30', 'r31', 'r32', 'r33', 'r34', 'r35', 'r36'],
        s: ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 's09', 's10', 's11', 's12', 's13', 's14', 's15', 's16', 's17', 's18', 's19', 's20', 's21', 's22', 's23', 's24', 's25', 's26', 's27', 's28', 's29'],
        t: ['t01', 't02', 't03', 't04', 't05', 't06', 't07', 't08', 't09', 't10']
      },
      kl: {
        e: ['e01', 'e02', 'e03', 'e04', 'e05', 'e06', 'e07', 'e08', 'e09', 'e10', 'e11', 'e12', 'e13', 'e14', 'e15', 'e16', 'e17'],
        f: ['f01', 'f02', 'f03', 'f04', 'f05', 'f06', 'f07', 'f08', 'f09', 'f10', 'f11', 'f12', 'f13', 'f14', 'f15', 'f16', 'f17', 'f18', 'f19', 'f20', 'f21'],
        g: ['g01', 'g02', 'g03', 'g04', 'g05', 'g06', 'g07', 'g08', 'g09', 'g10', 'g11', 'g12', 'g13', 'g14', 'g15', 'g16', 'g17', 'g18', 'g19', 'g20', 'g21', 'g22'],
        h: ['h01', 'h02', 'h03', 'h04', 'h05', 'h06', 'h07', 'h08', 'h09', 'h10', 'h11', 'h12', 'h13', 'h14', 'h15', 'h16', 'h17', 'h18', 'h19', 'h20', 'h21', 'h22', 'h23', 'h24', 'h25'],
        j: ['j01', 'j02', 'j03', 'j04', 'j05', 'j06', 'j07', 'j08', 'j09', 'j10', 'j11', 'j12', 'j13', 'j14', 'j15', 'j16', 'j17', 'j18', 'j19', 'j20', 'j21', 'j22', 'j23', 'j24', 'j25', 'j26', 'j27', 'j28', 'j29', 'j30', 'j31', 'j32', 'j33', 'j34', 'j35']
      }
    },
    districts: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't'],
    regions: ['hk', 'kl', 'nt']
  };

  svc._data.areas = _.sortBy(_.flatten(_.map(_.values(svc._data.geoTree), _.values)));

  // Region to Districts
  svc.getDistrictsFromRegion = function(region) {
    region = region.toLowerCase();
    if (_.isUndefined(svc._data.geoTree[region])) {
      throw String(region) + ' is not a valid region';
    } else {
      return _.keys(svc._data.geoTree[region]);
    }
  };

  // Districts to Region
  svc.getRegionFromDistrict = function(district) {
    var thisRegion;
    district = district.toLowerCase();
    for (var i = 0; i < svc._data.regions.length; i++) {
      thisRegion = svc._data.regions[i];
      if (_.contains(_.keys(svc._data.geoTree[thisRegion]), district)) {
        return thisRegion;
      }
    }

    throw String(district) + ' is not a valid district';
  };

  // District from Area
  // Simply the first letter of the code, but structure as a promise for consistency
  svc.getDistrictFromArea = function(area) {
    var district = area.toLowerCase().charAt(0);
    if (!_.contains(svc._data.districts, district)) {
      throw String(district) + ' is not a valid district';
    } else {
      return district;
    }
  };

  // Areas from District
  svc.getAreasFromDistrict = function(district) {
    district = district.toLowerCase();
    var region = svc.getRegionFromDistrict(district);
    return svc._data.geoTree[region][district];
  };

  svc.getAllAreas = function() {
    return svc._data.areas;
  };

  svc.getAllDistricts = function() {
    return svc._data.districts;
  };


  return svc;
}]);