var express = require('express');
var mysql = require('mysql');
var aws = require('aws-sdk');
var db_config = require('../config/db_config.json');
aws.config.loadFromPath('./config/aws_config.json');
var multer = require('multer');
var multerS3 = require('multer-s3');
var router = express.Router();
var passport = require('passport');
var s3 = new aws.S3();

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'sopt-hj',
        acl: 'public-read',
        key: function(req, file, cb) {
            cb(null, "saleImage_"+ Date.now() + '.' + file.originalname.split('.').pop());
        }
    })
});

var pool = mysql.createPool({
    host: db_config.host,
    port: db_config.port,
    user: db_config.user,
    password: db_config.password,
    database: db_config.database,
    connectionLimit: db_config.connectionLimit
});

/* GET home page. */
router.get('/', function(req, res, next) {
  var query = 'select * from MainSale left join brand on MainSale.brand_id = brand.brand_id'
  pool.getConnection(function(error, connection) {
      if (error) {
          console.log("getConnection Error" + error);
          res.sendStatus(500);
      } else {
          connection.query(query, function(error, rows) {
              if (error) {
                  console.log("Connection Error" + error);
                  res.sendStatus(500);
                  connection.release();
              } else {
                  res.render('mainsale', { data: rows });
                  connection.release();
              }
          });
      }
  });
});


//메인 세일정보 가져오기
router.get('/main', function(req, res, next) {
  var query = "select * from MainSale  ORDER BY RAND() limit 5"
  pool.getConnection(function(error, conn){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
        conn.query(query,  function(err2, cursor2){
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

//메인 세일정보 가져오기
router.get('/main2', function(req, res, next) {
  var query = "select * from MainSale"
  pool.getConnection(function(error, conn){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
        conn.query(query,  function(err2, cursor2){
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

//메인 세일정보 가져오기
router.get('/calendar', function(req, res, next) {
  //var value = [req.params.user_id]
  //var query = "SELECT distinct sale_id, CalendarSale.brand_id, sale_info, sale_day, sale_end FROM  WishList left join CalendarSale on CalendarSale.brand_id = WishList.brand_id where WishList.user_id = ? limit 5;"
  var query="SELECT * FROM CalendarSale ORDER BY RAND() limit 5";
  pool.getConnection(function(error, conn){
    if (error){
      console.log("getConnection Error" + error);
      res.sendStatus(500);
    }
    else{
        conn.query(query, function(err2, cursor2){
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


//세일 정보 등록
router.post('/add', upload.single('sale_image'), function(req, res, next) {
  console.log(req.body);
  var data = req.body;
  var sql = 'insert into MainSale(brand_id, sale_title, sale_info, sale_day, sale_image) values(?,?,?,?,?)';
  var value = [req.body.brand_id, req.body.sale_title, req.body.sale_info, req.body.sale_day, req.file.location];

  pool.getConnection(function(error, connection) {
      if (error) {
          console.log("getConnection Error" + error);
          res.sendStatus(500);
      } else {
          connection.query(sql,value, function(error, rows) {
              if (error) {
                  console.log("Connection Error" + error);
                  res.sendStatus(500);
                  connection.release();
              } else {
                  res.status(200).send({'result':true});
                  connection.release();
              }
          });
      }
  });
});


router.post('/delete', function(req, res, next) {
  var query = 'delete from MainSale where mainsale_id = ?'
  var value = [req.body.mainsale_id];
  pool.getConnection(function(error, connection) {
      if (error) {
          console.log("getConnection Error" + error);
          res.sendStatus(500);
      } else {
          connection.query(query, value, function(error, rows) {
              if (error) {
                  console.log("Connection Error" + error);
                  res.sendStatus(500);
                  connection.release();
              } else {
                  res.status(200).send({'result':true});
                  connection.release();
              }
          });
      }
  });
});


router.get('/session', function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.json({result: -1})
  } else {

      res.json({result: 1})
  }
})


module.exports = router;
