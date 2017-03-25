// Code heavily inspired by https://github.com/Distelli/Example-MEAN-App
var User = require('../models/user');
var config = require('../../config');
var jwt = require('jsonwebtoken');

var UserController;

UserController = (function() {

	function UserController() {}

	UserController.checkToken = function(req,res,next) {

		//check header or url parameters or post parameters for token
		var token = req.body.token || req.param('token') ||req.headers['x-access-token'];
		var secret = config.secret;

		//decode token
		if(token){
			//verifies secret and checks exp
			jwt.verify(token,secret,function(err,decoded){
				if(err){
					return res.status(403).send({
						success: false,
						message: 'Failed to authenticate token.'
					});
				}else{
					//save to request for use in other routes
					req.decoded = decoded;
					next();
				}
			});
		}else{
			// if there is no token
			//return an HTTP response of 403 (access forbidden) and an error message
			return res.status(403).send({
				success:false,
				message: 'No token provided.'
			});
		}
	}

	UserController.authenticate = function(req, res){
		//find the user
		//select the name, username and password explicitly
		var secret = config.secret;

		User.findOne({
			username: req.body.username
		}).select('name username password').exec(function(err,user){
			if(err) throw err;

			//no user with that username was found
			if(!user){
				res.json({
					success:false,
					message:'Authencation failed.'
				});
			}else if (user){
				//check if password matches
				var validPassword = user.comparePassword(req.body.password);
				if(!validPassword){
					res.json({
						success: false,
						message: 'Authencation failed'
					});
				}else{
					//if user is found and password is right
					//create a token
					var token = jwt.sign({
						username: user.username
					}, secret, {
						expiresIn: 86400 //  (24hrs)
						// expires in 3600 * 24 = c (24 hours)
					});
					//return json object, information including token as JSON
					res.json({
						username: user.username,
						success: true,
						message: 'Enjoy your token!',
						token: token
					});
				}
			}
		});
	}

	UserController.register = function(req,res) {
		//create a new instance of the User model
		var user = new User();

		//set the users information (comes from the request)
		user.username = req.body.username;
		user.password = req.body.password;
		user.password2 = req.body.password2;

		if(!user.username)
		{
			return res.json({success: false,
				message: 'Username is required.'});
		}
		else if(!user.password)
		{
			return res.json({success: false,
				message: 'Password is required.'});
		}
		else if(!user.password2)
		{
			return res.json({success: false,
				message: 'Confirmation of password\ is required.'});
		}
		else if(user.password != user.password2)
		{
			return res.json({success: false,
				message: 'Passwords do not match.'});
		}

		//save the user and check for errors
		user.save(function(err){
			if (err){
				//duplicate entry
				if(err.code == 11000)
					return res.json({success: false,
						message: 'A user with that\ username already exists.'});
				else
					return res.send(err);
			}
			return res.json({success: true, message:'User created!' });
		});
	}

	UserController.getUser = function(req, res){
		res.send(req.decoded);
	}

	return UserController;
})();

module.exports = UserController;
