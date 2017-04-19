/*jslint node: true */
'use strict';

var angular;

// Declare app level module which depends on views, and components
var app = angular.module('dragonfly', [
  'ngRoute',
  'dragonfly.maincontroller',
  'dragonfly.gaugecontroller',
  'dragonfly.treecontroller',
  'dragonfly.graphcontroller',
  'dragonfly.services'
])

.config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider){
    // $routeProvider.otherwise({redirectTo: '/'});
    $routeProvider.when('/', {
        templateUrl: '/templates/base.html',
        reloadOnSearch: false
    });
}]);