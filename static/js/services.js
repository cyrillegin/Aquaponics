/*jslint node: true */
'use strict';

angular.module('dragonfly.services', [])

.factory('dataService', function() {
    var data = {};
    var selection;
    return {
        selection: function() {
            return selection;
        },
        data: function() {
            return data;
        },
        set: function(info) {
            data = info;
        },
        select: function(name) {
            selection = name;
        }
    };
})

.factory('apiService', ['$http', function($http) {
    var urlBase = '/api/';
    var apiService = {};

    apiService.get = function(Str) {
        return $http.get(urlBase + Str);
    };

    apiService.post = function(Str, params) {
        return $http.post(urlBase + Str, params);
    };
    return apiService;
}]);
