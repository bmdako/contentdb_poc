var http = require("http")
var serverUrl = "http://localhost:5000"
var Bliss = require('bliss')
var bliss = new Bliss()

module.exports.showMainPage = function(request, response) {
	response.send(bliss.render(
		'templates/orders',
		{name: "test"},
		[{title: "1"}, {title:"2"}]))
}

module.exports.showArticle = function (request, response) {
	response.send(501)
}

module.exports.showRawArticle = function (request, response) {
	http.get( serverUrl + "/api/article/json/" + request.params.id, function(res) {
  		res.setEncoding('utf8');
    	res.on('data', function(chunk){
        	response.send(200, chunk)
    	})
	}).on('error', function(e) {
  		response.send(404, e.message)
	})
}