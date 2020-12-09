var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var fileUpload = require('express-fileupload');
var passport = require('passport');

mongoose.connect(config.database, {useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('we are connected to mongodb')
});


var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

app.locals.errors = null;

var Page = require('./models/page');

Page.find({}).sort({sorting: 1}).exec(function (err, pages){
  if(err) {
    console.log(err);
  } else {
    app.locals.pages = pages;
  }
});

var Category = require('./models/category');

Category.find(function (err, categories){
  if(err) {
    console.log(err);
  } else {
    app.locals.categories = categories;
  }
});

app.use(fileUpload());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
 // cookie: { secure: true }
}));

app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param :formParam,
      msg : msg,
      value : value
    };
  },
  customValidators: {
    isImage: function (value, filename){
      var extension = (path.extname(filename)).toLowerCase();
      switch (extension) {
        case '.jpg':
          return  '.jpg';
        case '.png':
          return  '.png';
        case '.jpeg':
          return  '.jpeg';
        case '':
          return  '.jpg';  
        default:
          return  false;
      }
    }
  }
}));

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;
  next();
});

var pages = require('./routes/pages');
var products = require('./routes/products');
var cart = require('./routes/cart');
var users = require('./routes/users');
var adminPages = require('./routes/admin_pages');
var adminCategories = require('./routes/admin_categories');
var adminProducts = require('./routes/admin_products');

app.use('/admin/pages', adminPages);
app.use('/products', products);
app.use('/cart', cart);
app.use('/users', users);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/', pages);

var port = 3000;
app.listen(port, function() {
    console.log('server started on port ' + port);
});