angular.module('MyApp', ['ngResource', 'ngMessages', 'ui.router', 'mgcrea.ngStrap', 'satellizer','n3-line-chart'])
  .config(function($stateProvider, $urlRouterProvider, $authProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'partials/home.html'
      })
      .state('login', {
        url: '/login',
        templateUrl: 'partials/login.html',
        controller: 'LoginCtrl'
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'partials/signup.html',
        controller: 'SignupCtrl'
      })
      .state('logout', {
        url: '/logout',
        template: null,
        controller: 'LogoutCtrl'
      })
      .state('details', {
        url: "/details/:id",
        templateUrl: 'partials/details.html',
        controller: 'DetailsCtrl'
      })
      .state('details_iteration', {
        url: "/details/:id/:iteration",
        templateUrl: 'partials/details_iteration.html',
        controller: 'DetailsCtrl'
      });

    $urlRouterProvider.otherwise('/');

  });
