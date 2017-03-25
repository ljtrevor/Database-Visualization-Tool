angular.module('mainCtrl', ['authService'])
	.controller('mainController',['$scope','Auth','$location','$rootScope',
		function($rootScope,Auth,$location,$scope) {
		var vm = this;

		vm.loggedIn = Auth.isLoggedIn();

		//check to see if a user is logged in on every request
		$rootScope.$on('$routeChangeStart', function () {
			vm.loggedIn = Auth.isLoggedIn();
		});

		//function to handle login form
		vm.doLogin = function () {
			vm.processing = true;
			vm.error = '';

			Auth.login(vm.loginData.username, vm.loginData.password)
				.success(function (data) {
						vm.processing = false;

					if (data.success) {
						//if a user successfully logs in, redirect to projects page
						$location.path('/projects');
						Auth.getUser()
							.then(function(data) {
								$scope.name = data.name;
							 })
						}
					else vm.error = data.message;
				});
		};

		//function to handle loggin out
		vm.doLogout = function () {
			Auth.logout();
			vm.user = {};
			$location.path('/login');
		}
	}]);





