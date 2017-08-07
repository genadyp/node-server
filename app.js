const express = require('express');
const socketio = require('socket.io')();

const crawler = require('./lib/crawler.js');
const db = require('./lib/db.js');

/*--------------------- Constants ----------------------*/

/*------------------------ Main ------------------------*/

const app = express();
app.socketio = socketio;

/*--------- app definitions ------------*/

app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.set('view engine', "pug");
app.engine('pug', require('pug').__express);

/*-------- app routes ------------------*/

app.get('/', function(req, res) {
  res.render('index', {
    rows: JSON.stringify([{
      url: "http://google.com"
    }, {
      url: "http://yahoo.com"
    }])
  });
});

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

/*------- socket handlers ---------*/

socketio.sockets.on('connection', socket => {
  socket.on('npmStop', () => {
    process.exit(0);
  });

  socket.emit('message', {
    message: 'welcome'
  });

  socket.on('crawl', data => {
    console.log(data);
    if (data && data.url) crawler.traverse(data.url);
  });

  socket.on('refs', async(data) => {
    console.log(data);
    if (data && data.url) {
      try {
        const refs = await db.findRefs(data.url);
        console.log("REFS: " + refs);
        socket.emit('refs', { refs: refs });
      } catch (e) {
        console.error("FAILED to get refs: " + e.message);
        refs = [];
        socket.emit('refs', { refs: [] });
      } 
    }
  });
});

/*---------------- Exports -------------------------------*/

module.exports = app;