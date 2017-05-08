var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const mongoose = require('mongoose');
var $ = require('jQuery');
const flash = require("connect-flash");
var auth = require('./helpers/auth');
var authRoute = require('./routes/auth-routes');
var index = require('./routes/index');
const users = require('./routes/users');
var main=require('./routes/main');
var profile=require('./routes/users');
const User = require('./models/user');

mongoose.connect("mongodb://localhost:27017/eat-with-usDB");

const session    = require("express-session");
const MongoStore = require("connect-mongo")(session);
const bcrypt       = require("bcrypt");
const passport = require('./helpers/passport');
const LocalStrategy = require("passport-local").Strategy;
// require user model



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// app.use(auth.setCurrentUser);
//session//

app.use(session({
  secret: "our-passport-local-strategy-app",
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 60000 },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  })
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// adding our own middleware so all pages can access currentUser
app.use((req, res, next) => {
  res.locals.currentUser = req.User;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

//routes
app.use('/', authRoute);
app.use('/', index);
app.use('/',profile);
app.use('/', main);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
