var express = require('express');
var mysql = require('mysql');
var aws = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');
var db_config = require('../config/db_config.json');
var router = express.Router();

aws.config.loadFromPath('./config/aws_config.json');

var s3 = new aws.S3();

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'sopt-hj',
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, Date.now() + '.' + file.originalname.split('.').pop());
    }
  })
});


var pool = mysql.createPool({
  host : db_config.host,
  port : db_config.port,
  user : db_config.user,
  password : db_config.password,
  database : db_config.database,
  connectionLimit : db_config.connectionLimit
});

//로그인 및 회원 가입
router.post('/', function(req, res, next) {
      console.log(req.body.user_id);
  pool.getConnection(function(error, connection){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
        connection.release();
    } else {
      connection.query('select * from User where user_id = ?',[req.body.user_id], function(error1, rows){
        if (error1){
          console.log("getConnection Error" + error1);
          res.sendStatus(500);
            connection.release();
        } else {
        if (rows[0]==undefined||rows[0]==null){
          console.log("in undefined");
          var iQuery = "insert into User(user_id, user_name) values(?,?)";
          var value = [req.body.user_id, req.body.user_name];

          connection.query(iQuery, value, function(error2, rows2){
            if(error2){
              console.log("getConnection Error" + error2);
              res.sendStatus(500);
              connection.release();
            }
            else {

              res.sendStatus(200);
              connection.release()
            }

          })
        }
        else {
          res.sendStatus(200);
          connection.release();
        }
      }
      });
    }
  });
});

//메인화면에서 브랜드 아이디 보내기
router.get('/main/:user_id', function(req, res, next) {
  pool.getConnection(function(error, connection){
    var uquery = 'select distinct brand_id from WishList where user_id=?;'
    var value = [req.params.user_id];
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
      connection.query(uquery, value, function(error2,row) {
        if(error2){
          console.log("Connection Error" + error2);
          res.sendStatus(500);
          connection.release();
        } else {
          res.status(200).send(row);
          connection.release();
        }
      })
    }
  });
});

module.exports = router;
