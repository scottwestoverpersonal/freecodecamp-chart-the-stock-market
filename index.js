var express = require('express');
var app = express();
var request = require('request');
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var stocks = ['GE'];

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render('pages/index');
});

app.get('/getStockData', function(req, res) {
  var parameters = {  
        Normalized: false,
        NumberOfDays: 3650,
        DataPeriod: "Day",
        Elements: [{Symbol: req.query.symbol,Type: "price",Params: ["ohlc"]}]
    };
  var url = 'http://dev.markitondemand.com/MODApis/Api/v2/InteractiveChart/json?parameters='+JSON.stringify(parameters);

request.get({
    url: url,
    json: true,
    headers: {
        'Content-Type': 'application/json'
    }
}, function (e, r, b) {
        res.json(b);
}); 
});

app.get('/getStocks', function(req, res) {
   var url = 'http://dev.markitondemand.com/api/v2/Lookup/json?input='+req.query.inp;

request.get({
    url: url,
    json: true,
    headers: {
        'Content-Type': 'application/json'
    }
}, function (e, r, b) {
        res.json(b);
});  
});

io.on('connection', function(socket){
  socket.send(JSON.stringify( { type: 'history', data: stocks} ));
  socket.on('chat message', function(msg){
    stocks.push(msg);
    io.emit('chat message', msg);
  });
  socket.on('remove message', function(msg){
    for(var j = 0; j < stocks.length; j++) {
      	if(stocks[j] === msg) {
      		stocks.splice(j, 1);
      		break;
      	}
      }
      io.emit('remove message', msg);
  });
});

server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});