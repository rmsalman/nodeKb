const express = require('express');
const router = express.Router();

// Bringing in Article Model
let Article = require('../models/article');
// Bringing in User Model
let User = require('../models/user');

// Add Route
router.post('/add', function(req, res){

	req.checkBody('title', 'Title is Required').notEmpty();
	// req.checkBody('author', 'Author is Required').notEmpty();
	req.checkBody('body', 'Body is Required').notEmpty();

	// Get Errors
	let errors = req.validationErrors();

	if(errors){
		res.render('add_article', {
			title: 'Add Article', 
			errors:errors
		});
	}else {

		let article = new Article();
		article.title = req.body.title;
		article.body = req.body.body;
		article.author = req.user._id;
		// article.author = req.body.author;


		article.save(function(err){
			if(err){
				console.log(err);
				return;
			}else {
				req.flash('success', 'Article Added')
				res.redirect('/');
			}
		});
	}
});


// Rout Add Article
router.get('/add', isLoggedIn, function(req, res) {
	res.render('add_article', { title: 'Add Article' });
})


// Add Route
router.post('/edit/:id', isLoggedIn, function(req, res){
	let article = {};
	article.title = req.body.title;
	article.body = req.body.body;
	article.author = req.body.author;

	let query = {_id:req.params.id}

	Article.update(query, article , function(err){
		if(err){
			console.log(err);
			return;
		}else {
			res.redirect('/');
		}
	})
});

// Edit Single Article
router.get('/edit/:id', isLoggedIn, function(req, res){
	Article.findById(req.params.id, function(err,article){
		if(article.author != req.user._id){
			req.flash('danger', 'You are not Authorized');
			res.redirect('/');	
		}
		res.render('edit_article', {
			title:'Editing Article',
			article:article
		})
	}); 
});

router.delete('/:id', function(req, res){

	if(!req.user._id){
		res.status(500).send();
	}

	Article.findById(req.params.id, function(err, article){
		if(article.author != req.user._id){
			res.status(500).send();
		}else {
			let query = {_id:req.params.id}
			Article.remove(query, function(err){
				if(err){
					console.log(err);
				}
				res.send('Success')
			});
		}
	});


});


// Get Single Article
router.get('/:id', function(req, res){
	Article.findById(req.params.id, function(err,article){

		User.findById(article.author, function(err, user){
			res.render('article', {
				article:article,
				author:user.name
			})
		});

	}); 
});


// Access Control 
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}else {
		req.flash('danger', 'Please Login');
		res.redirect('/users/login');
	}
}


module.exports = router;