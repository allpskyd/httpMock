
/**
 * Module dependencies.
 */
var express = require('express'),
	config = require('./config'),
	logger = require('./logger'),
	bodyParser = require('body-parser');
	mockInfo = require('./mock/mock.js'),
    mockUtil = require('./routes/mockUtil.js'),
	app = express(),
	router = express.Router();
	
app.set('views', './views')
app.set('view engine', 'jade');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

router.use(function (req, res, next) {
  console.log('Time:', Date.now());

  if ("/" == req.originalUrl) {
	  
	  next()
	  
	  return;
  }
  
  var matchedJson = mockUtil.checkUrl(req.originalUrl, req.method, mockInfo);

  if (matchedJson.length > 0) {
	  
	  var target = mockUtil.checkParams(req.originalUrl, req.body, matchedJson);
	  
	  if (target) {
		 res.send(target.expect); 
	  } else {
		  res.send("参数不正确");
	  }
	  
  } else {
	res.send("无匹配的URL");
  }
  
  //next();
});

app.use('/', router);

app.get('/', function (req, res) {
	
	res.render('index', { title: 'ms', message: 'MOCK'});
 
});

app.get('/ping/:callback?', function(req, res){
 
	var strResult = "pong";
 
    // json or jsonp
    if(req.params.callback) {
        res.send(req.params.callback + '("' + strResult + '");');
    } else {
        res.send(strResult);
    }

});

var server = app.listen(process.env.port || config.env.port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});