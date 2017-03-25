angular.module('app.routes', ['ngRoute'])
.config(function($routeProvider, $locationProvider) {
    $routeProvider

        // route for the home page
        .when('/projects', {
            templateUrl : '/app/views/pages/projects.html',
            controller : 'projectController',
            controllerAs : 'projects'
        })

        //login page
        .when('/login', {
            templateUrl : '/app/views/pages/login.html',
        	controller   : 'mainController',
        	controllerAs   : 'login'
        })

        // create a new account
        .when('/register',  {
            templateUrl: '/app/views/pages/registration.html',
            controller: 'userCreateController',
            controllerAs: 'user'
        })

        // ER diagram page
        .when('/visualize', {
            templateUrl: '/app/views/pages/visualize.html',
            controller: 'visualizeController',
            controllerAs: 'visualize'
        })

        .otherwise({redirectTo:'/projects'});

    $locationProvider.html5Mode(true);
});