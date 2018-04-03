const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const passport = require('passport');


// Bringing in User Model
let User = require('../models/user');

router.get('/register', function(req, res){
	res.render('register');
});

// Register Process
router.post('/register', function(req, res){
	const name = req.body.name
	const email = req.body.email
	const username = req.body.username 
	const password = req.body.password
	const password2 = req.body.password2

	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is required').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Password2 is required').notEmpty();
	req.checkBody('password2', 'Password do not match').equals(req.body.password);

	let errors = req.validationErrors();

	if(errors){
		res.render('register', {
			errors:errors
		});
	}else {
		let newUser = new User({
			name:name,
			email:email,
			username:username,
			password:password
		});

		bcrypt.genSalt(10, function(err, salt){
			bcrypt.hash(newUser.password, salt, function(err, hash){
				if(err){
					consol.log(err);
				}
				newUser.password = hash;
				newUser.save(function(err){
					if(err){
						consol.log(err);
						return
					}else{
						req.flash('success', 'you are now registered');
						res.redirect('/users/login');
					}
				});	
			});
		})
	}
});

// for Login Request
router.get('/login', function(req, res){
	res.render('login');
});

// Login Process

router.post('/login', function(req, res, next){
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/users/login',
		failureFlash: true
	})(req, res, next);
});

router.get('/logout', function(req, res){
	req.logout();
	req.flash('success', 'You are Logged Out');
	res.redirect('/users/login');
});


module.exports = router; 