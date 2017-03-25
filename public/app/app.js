angular.module('userApp', [
	'ngAnimate',
	'app.routes',
	'authService',
	'userService',
	'projectService',
	'visualizeService',
	'mainCtrl',
	'userCtrl',
	'projectCtrl',
	'visualizeCtrl'
	])
.config(function($httpProvider)	{	
	$httpProvider.interceptors.push('AuthInterceptor');
});