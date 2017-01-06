var fs=require('fs');
var ejs=require('ejs');
var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var aws = require('aws-sdk');
var bodyParser=require('body-parser');
var db_config = require('../config/db_config.json');
aws.config.loadFromPath('./config/aws_config.json');
var multer = require('multer');
var multerS3 = require('multer-s3');
var s3 = new aws.S3();


var pool=mysql.createPool({
    host: db_config.host,
    port: db_config.port,
    user: db_config.user,
    password: db_config.password,
    database: db_config.database,
    connectionLimit: db_config.connectionLimit

});

router.use(bodyParser.urlencoded({
	extended: false
}));

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });



router.get('/test',function(request, response){
	pool.getConnection(function(error, connection) {
		if(error){

		}else{
			//console.log(__dirname);
			response.send('<h1>test</h1>');
		}
	});

});

//////////////////////////////////////////////


router.get('/',function(request, response){
	pool.getConnection(function(error, connection) {
		if(error){

		}else{
			fs.readFile('/home/ubuntu/beautypocket/views/list.html','utf8',function(error, data){

			//	client.query('select * from new_table',function(error, results){
				connection.query('select * from CalendarSale',function(error, results){
					response.send(ejs.render(data,{
						data: results
					}));
				});
			});
		}
	});

});

////////
router.get('/delete/:sale_id',function(request, response){

	pool.getConnection(function(error, connection){
		if(error){

		}else{
			connection.query('delete from CalendarSale where sale_id=?',[request.params.sale_id],function(){
				response.redirect('/mysql');
			});
		}
	});



});

/////////
router.get('/insert',function(request, response){

	fs.readFile('/home/ubuntu/beautypocket/views/insert.html','utf8',function(error, data){
		response.send(data);
	});

});


router.post('/insert',function(request, response){

	pool.getConnection(function(error, connection){
		if(error){

		}else{

			var body=request.body;
      var arr = (body.sale_day1.split('-'))
      var sale_day =  arr[0]+arr[1]+arr[2];
      var endArr = (body.sale_day2.split('-'));
      var sale_end = endArr[0]+endArr[1]+endArr[2];
			var values=[body.brand_id,body.sale_info, sale_day,sale_end];
			connection.query('insert into CalendarSale (brand_id, sale_info, sale_day,sale_end) values(?,?,?,?)',values,function(){
				response.redirect('/mysql');
			});
		}
	});


});

///////

// router.get('/edit/:sale_id',function(request, response){

// 	pool.getConnection(function(error, connection){
// 		if(error){

// 		}else{
// 			fs.readFile('/home/ubuntu/beautypocket/views/edit.html','utf8',function(error, data){
// 				var value=[request.params.sale_id];
// 				connection.query('select * from CalendarSale where sale_id = ?',value,function(error, result){
// 					response.send(ejs.render(data,{
// 						data: result[0]
// 					}));
// 				});
// 			});
// 		}
// 	});




// });


// router.post('/edit/:sale_id',function(request, response){

// 	pool.getConnection(function(error, connection){
// 		if(error){

// 		}else{
// 			//var body=request.body;
// 			var values=[request.body.sale_info, request.body.sale_day, request.params.sale_id];
// 			connection.query('update CalendarSale set sale_info=?, sale_day=? where sale_id=?',values, function(){
// 				response.redirect('/mysql');
// 			});
// 		}
// 	});





// });




module.exports = router;
