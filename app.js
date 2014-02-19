var express = require('express');
var app = express();
app.use(express.logger());
app.use(express.bodyParser());
app.use(express.favicon());
app.use('/', express.static('./client'));

var repository = require('./core/repository.js');

app.get('/', function(request, response){
	response.sendfile('./client/edit.html');
});

app.get('/api', function(request, response) {
	response.send(400);
});
app.post('/api', repository.save);
app.get('/api/query', repository.query);
app.get('/api/node/:id', repository.getNodeFromBond);
app.get('/api/nodequeue/:id', repository.getNodeQueueFromBond);
app.put('/api/diff/:id', repository.diff);
app.get('/api/scan', repository.scan);
app.put('/api/scan', function(request, response) {
	response.send(400)
});
app.post('/api/scan', function(request, response) {
	response.send(400)
});
app.get('/api/:id', repository.scan);
app.get('/api/:id/:version', repository.get);
app.put('/api/:id', repository.update);
app.delete('/api/:id', repository.delete);

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
