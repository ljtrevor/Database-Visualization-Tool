angular.module('userCtrl',['userService'])
	.controller('userCreateController', function(User)	{

		var vm = this;

		// function to create a user
		vm.saveUser = function()	{
			vm.processing = true;

			vm.message = '';

			User.create(vm.userData)
			.success(function (data)	{
				vm.processing = false;
				vm.userData = {};
				vm.message = data.message;
				vm.success = data.success;
			});
		};

	});
