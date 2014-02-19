var express = require('express');
var app = express();
app.use(express.logger());
app.use(express.bodyParser());
app.use(express.favicon());
app.use('/', express.static('./client'));

var dynamodb = require('./core/dynamodb.js');

app.get('/', function(request, response){
	response.sendfile('./client/edit.html');
});

app.get('/api', function(request, response) {
	response.send(400);
});
app.post('/api', dynamodb.save);
app.get('/api/query', dynamodb.query);
app.get('/api/node/:id', dynamodb.getNodeFromBond);
app.get('/api/nodequeue/:id', dynamodb.getNodeQueueFromBond);
app.put('/api/diff/:id', dynamodb.diff);
app.get('/api/scan', dynamodb.scan);
app.put('/api/scan', function(request, response) {
	response.send(400)
});
app.post('/api/scan', function(request, response) {
	response.send(400)
});
app.get('/api/:id', dynamodb.scan);
app.get('/api/:id/:version', dynamodb.get);
app.put('/api/:id', dynamodb.update);
app.delete('/api/:id', dynamodb.delete);

app.get("/oauth2callback", function(request, response){
	console.log("oauth2callback");
	console.log(request);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log('Server running at http://127.0.0.1:' + port + '/');
}).on('error', function(e){
	console.log(e);
});
