var express = require('express');
var util = require('util');
var fs = require('fs');
var ejs = require('ejs');
var http = require('http');
var router = express.Router();
var passport = require('passport');

require('./passport').setup();

router.get('/', function(req, res, next) {
  fs.readFile('/home/ubuntu/beautypocket/views/manger_login.html', 'utf8', function(error, data) {
       res.writeHead(200, {
           'Content-Type': 'text/html'
       });
       res.end(data);
   });
});


router.post('/login', passport.authenticate('local', {
      failureFlash: true
    }),
    function(req, res) {
        res.json({result: 1})
    }
);




module.exports = router;
