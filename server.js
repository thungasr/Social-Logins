// dependencies
var fs = require('fs');
var express = require('express');
var session = require('express-session');
var routes = require('./routes');
var path = require('path');
var config = require('./oauth.js');
var User = require('./user.js');
var mongoose = require('mongoose');
var passport = require('passport');
var fbAuth = require('./authentication.js');
var TwitterStrategy = require('passport-twitter').Strategy;
var GithubStrategy = require('passport-github2').Strategy;
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var LinkedinStrategy = require("passport-linkedin").Strategy;
//var InstagramStrategy = require('passport-instagram').Strategy;

// connect to the database
mongoose.connect('mongodb://heroku_7d9nm4j8:or2qd4f8n9v6hqcbrmocuvo7tj@ds025449.mlab.com:25449/heroku_7d9nm4j8');

var app = express();

//app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  //app.use(express.logger());
  //app.use(express.cookieParser());
  //app.use(express.bodyParser());
  //app.use(express.methodOverride());
  app.use(new session({ secret: 'my_precious' }));
  app.use(passport.initialize());
  app.use(passport.session());
  //app.use(app.router);
  app.use(express.static(__dirname + '/public'));
//});

// serialize and deserialize
passport.serializeUser(function(user, done) {
  console.log('serializeUser: ' + user._id);
  done(null, user._id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user){
    console.log(user);
      if(!err) done(null, user);
      else done(err, null);
    });
});

// routes
app.get('/', routes.index);
app.get('/ping', routes.ping);
app.get('/account', ensureAuthenticated, function(req, res){
  User.findById(req.session.passport.user, function(err, user) {
    if(err) {
      console.log(err);  // handle errors
    } else {
      res.render('account', { user: user});
    }
  });
});

app.get('/auth/facebook',
  passport.authenticate('facebook'),
  function(req, res){});
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/account');
  });

app.get('/auth/twitter',
  passport.authenticate('twitter'),
  function(req, res){});
app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/account');
  });

app.get('/auth/github',
  passport.authenticate('github'),
  function(req, res){});
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/account');
  });

app.get('/auth/google',
  passport.authenticate('google', { scope: [
    'https://www.googleapis.com/auth/plus.login',
    'https://www.googleapis.com/auth/plus.profile.emails.read'
  ] }
));
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/account');
  });

app.get('/auth/instagram',
  passport.authenticate('instagram'),
  function(req, res){});
app.get('/auth/instagram/callback',
  passport.authenticate('instagram', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/account');
  });

app.get('/auth/linkedin',
  passport.authenticate('linkedin',{state:'CA'}),
  function(req, res){});
app.get('/auth/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/account');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// port
app.listen(process.env.PORT || 1337);
//console.log("Node application listening on http://127.0.0.1:1337");

// test authentication
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}

module.exports = app;
