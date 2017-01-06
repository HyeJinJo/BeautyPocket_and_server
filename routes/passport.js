'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var user_config = require('../config/manager.json');


exports.setup = function () {
  passport.use(new LocalStrategy({
        usernameField: 'id',
        passwordField: 'passwd'
      },
      function(email, passwd, done) {
        if (email == user_config.id) {
          if (passwd == user_config.pw) {
            var user = { 'id':user_config.id};
            return done(null, user);
          } else {
            return done(null, false, { message: 'Fail to login.' });
          }
        } else {
          return done(null, false, { message: 'Fail to login.' });
        }
      }
  ));



passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
})
};
