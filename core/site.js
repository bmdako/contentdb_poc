var http = require("http")
var serverUrl = "http://localhost:5000"
var Bliss = require('bliss')
var bliss = new Bliss()


module.exports.visForside = function(request, response) {
	response.send(bliss.render('templates/main', "forside"))
}

module.exports.visArtikel = function (request, response) {
	http.get( serverUrl + "/api/article/json/" + request.params.id, function(res) {
  		res.setEncoding('utf8');
    	res.on('data', function(article){
        	response.send(bliss.render('templates/main', "artikel", JSON.parse(article)))
    	})
	}).on('error', function(e) {
  		response.send(404, e.message)
	})	
}

module.exports.visSektion = function(request, response) {
	response.send(bliss.render('templates/main', "." + request.path))
}

module.exports.visRaaArtikel = function (request, response) {
	http.get( serverUrl + "/api/article/json/" + request.params.id, function(res) {
  		res.setEncoding('utf8');
    	res.on('data', function(chunk){
        	response.send(200, chunk)
    	})
	}).on('error', function(e) {
  		response.send(404, e.message)
	})
}
