'use strict'

var MapCtrl = function($scope, $http) {

    //only when DOM ready? or 
    angular.extend($scope, {
        defaults: {
            scrollWheelZoom: false,
            maxZoom: 18
        },
        center: {
            lat: 22.298,
            lng: 114.151,
            zoom: 12
        },
        layers: {
            baselayers: {
                googleRoadmap: {
                    name: 'Google Streets',
                    layerType: 'ROADMAP',
                    type: 'google'
                },
                googleTerrain: {
                    name: 'Google Terrain',
                    layerType: 'TERRAIN',
                    type: 'google'
                },
                googleHybrid: {
                    name: 'Google Hybrid',
                    layerType: 'HYBRID',
                    type: 'google'
                }
            }
        },
        path: {
            weight: 10,
            color: '#800000',
            opacity: 1
        }

        // markers: {
        //     dummy1: {
        //         lat: 22.288,
        //         lng: 114.113,
        //         message: "This is Madrid. But you can drag me to another position",
        //     }
        // }
    });

     var style = function(feature) {
        return {
            fillColor: '#CC0066',
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }

    $http.get("scripts/geo/dc_polygon.geo.json").success(function(data, status) {
        console.log('got polygon'+status);
        console.log(data);
        angular.extend($scope, {
            geojson: {
                data: data,
                // style: style,
                resetStyleOnMouseout: true
            }
        });
        console.log('updated scope')
        console.log($scope);


    });

    // $scope.$watch('spots', function(spots) {

    //     console.log('spots changed ');

    //     console.log("in map ctrl");
    //     console.log($scope.spots);


    //     //validate spots correct


    //     // $scope.markers = _.chain($scope.spots).filter(function(spot) {

    //     //     return !!spot && !! spot.location;
    //     // }).map(function(spot) {
    //     //     return {
    //     //         title: spot.title,
    //     //         lat: spot.location.lat,
    //     //         lng: spot.location.lng
    //     //     }
    //     // }).value();

    //     // console.log($scope.markers);
    // }, true);

    //repalce spots vars


};



angular.module('frontendApp')
    .controller('MapCtrl', MapCtrl);