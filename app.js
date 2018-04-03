const express = require('express');
const path    = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');

mongoose.connect(config.database);
let db = mongoose.connection;

// check db Connection
db.once('open', function(){

	console.log('Mongo Db Connected');

});


// check db Errors
db.on('error', function(err){

	console.log(err);

});

// init apps
const app  = express();


// body parser

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


// public folder
app.use(express.static(path.join(__dirname, 'public')));


// views engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// Express Session Middleware
app.use(session({
	secret: 'keyboard cat',
	resave: true,
	saveUninitialized: true,
}));


// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


app.use(expressValidator({
	errorFormatter: function(param, msg,value){
			var namespace = param.split('.'),
			root		  = namespace.shift(),
			formParam	  = root;

		while(namespace.length){
			formParam += '[' + namespace.shift() + ']';
		}

		return {
			param : formParam,
			msg   : msg,
			value : value
		};
	}
}));


// passport config

require('./config/passport')(passport);


// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());


app.get('*', function(req, res, next){
	res.locals.user = req.user || null;
	next();
});


// Bring Model in
let Article = require('./models/article');




// Home Route
app.get('/', function(req, res) {


	Article.find({}, function(err,articles){
		if(err){
			console.log(err);
		}else {
			res.render('index', { title: 'Rana', articles: articles }); 
		}
	});


	// let articles = [
	// 	{
	// 		id:1,
	// 		title: 'Article One',
	// 		author: 'Rana One',
	// 		body: 'This is an Article One'
	// 	},
	// 	{
	// 		id:2,
	// 		title: 'Article Two',
	// 		author: 'Rana Two',
	// 		body: 'This is an Article Two'
	// 	},
	// 	{
	// 		id:3,
	// 		title: 'Article Three',
	// 		author: 'Rana Three',
	// 		body: 'This is an Article Three'
	// 	}
	// ]

});

let articles = require('./routes/articles');
let users = require('./routes/user');
app.use('/articles', articles);
app.use('/users', users);



app.listen(3010)