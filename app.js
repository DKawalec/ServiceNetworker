var ipaddress    = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port         = process.env.OPENSHIFT_NODEJS_PORT || 3000;

var express      = require('express');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var bodyParser   = require('body-parser');
var multer       = require('multer');
var fs           = require('fs');

var routes       = require('./routes/index');
var csvupload    = require('./routes/csvupload');
var xmlupload    = require('./routes/xmlupload');
var archive      = require('./routes/archive');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
// in latest body-parser use like below.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(multer({ dest: './upload/'}))

app.use('/', routes);
app.use('/csvupload', csvupload);
app.use('/xmlupload', xmlupload);
app.use('/archive', archive);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// setup directory structure
// this is ugly but w/e
var dir = process.env.OPENSHIFT_DATA_DIR;
if (dir) {
  if (!fs.existsSync(dir + '\\nos')){
    fs.mkdirSync(dir + '\\nos');
  }
  if (!fs.existsSync(dir + '\\dnos')){
    fs.mkdirSync(dir + '\\dnos');
  }
}

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


app.listen(port, ipaddress);
