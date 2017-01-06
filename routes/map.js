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

//통합 지도 (내가 위시리스트에 등록한 브랜드 모두 700미터 이내에 있을 때 정보 가져오기)
router.post('/totalMap', function(req, res, next) {
  var mQuery = "SELECT distinct store_id,store.brand_id,store_name, store_name, store_tel, store_address, store_latitude, store_longitude,(6371*acos(cos(radians(?))*cos(radians(store_latitude))*cos(radians(store_longitude)-radians(?))+sin(radians(?))*sin(radians(store_latitude))))	AS distance FROM store join WishList on WishList.brand_id = store.brand_id where WishList.user_id = ? HAVING distance <= 1 ORDER BY distance"
  var data = req.body;
  var values =  [data.store_latitude, data.store_longitude, data.store_latitude, data.user_id]
  pool.getConnection(function(error, conn){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
      console.log(req.body.store_latitude+" ," +req.body.store_longitude);
        conn.query(mQuery, values, function(err2, cursor2){
          if(err2){
            console.log("Connection Error" + err2);
            res.sendStatus(500);
            conn.release();
          } else {
            res.status(200).send(cursor2);
            conn.release();
          }
        });
    }
  });
});


//브랜드 별 700미터 이내의 매장 정보 가져오기.
router.post('/brandmap', function(req, res, next) {
  var sQuery = "select * from brand where brand_id = ?";
  var mQuery = "SELECT distinct *,(6371*acos(cos(radians(?))*cos(radians(store_latitude))*cos(radians(store_longitude)-radians(?))+sin(radians(?))*sin(radians(store_latitude))))	AS distance FROM store where brand_id = ? HAVING distance <= 1 ORDER BY distance"
  var data = req.body;
  pool.getConnection(function(error, conn){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
      conn.query(sQuery, [data.brand_id], function(error, rows){
        if (error){
          console.log("Connection Error" + error);
          res.sendStatus(500);
          conn.release();
        }
        else {
          console.log(req.body.store_latitude+" ," +req.body.store_longitude+","+ data.brand_id);
          conn.query(mQuery, [data.store_latitude, data.store_longitude, data.store_latitude, rows[0].brand_id], function(err2, cursor2){
            if(err2){
              console.log("Connection Error" + err2);
              res.sendStatus(500);
              conn.release();
            } else {
              res.status(200).send(cursor2);
              conn.release();
            }
          })
        }
      });
    }
  });
});


//알람서비스
//통합 지도 (내가 위시리스트에 등록한 브랜드 모두 700미터 이내에 있을 때 정보 가져오기)
router.post('/alertLoc', function(req, res, next) {
  var mQuery = "SELECT store_id,store.brand_id,store_name, store_name, store_tel, store_address, store_latitude, store_longitude,(6371*acos(cos(radians(?))*cos(radians(store_latitude))*cos(radians(store_longitude)-radians(?))+sin(radians(?))*sin(radians(store_latitude))))	AS distance FROM store join WishList on WishList.brand_id = store.brand_id where WishList.user_id = ? HAVING distance <= 1 ORDER BY distance limit 1"
  var data = req.body;
  var values =  [data.store_latitude, data.store_longitude, data.store_latitude, data.user_id]
  pool.getConnection(function(error, conn){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
        conn.query(mQuery, values, function(err2, cursor2){
          if(err2){
            console.log("Connection Error" + err2);
            res.sendStatus(500);
            conn.release();
          } else {

            res.status(200).send(cursor2[0]);
            conn.release();
          }
        });
    }
  });
});


module.exports = router;
