var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;



var User = require('../models/user');

// Register
router.get('/register', function(req, res){
	res.render('register');
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});

router.post('/register', function(req, res){
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password;

	console.log(username);


	// password validation

	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'password is required').notEmpty();
	req.checkBody('password2', 'confirmed password is required').notEmpty();
	req.checkBody('password2', 'passwords do not match'). equals(req.body.password);

	var errors = req.validationErrors();

	if(errors) {
		console.log('There are errors');
		res.render('register', {
			errors:errors
		})
	}
	
	else {
		console.log('There are no errors');
		var newUser = new User({
			username: username,
			password: password 

	
	});
		User.createUser(newUser,function(err, user){
			if(err) throw err;
			console.log(user);
		});
	
		req.flash('success_msg', 'You are registered and can now log in!');
		res.redirect('/');

	}

});


passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/users/login', failureRedirect:'/',failureFlash: true}),
  function(req, res) {
    res.redirect('/users/login');
  });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/');
});

module.exports = router;