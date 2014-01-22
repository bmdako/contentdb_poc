var http = require("http")
var serverUrl = "http://localhost:5000"

module.exports.showArticle = function (request, response) {
	http.get( serverUrl + "/api/article/json/" + request.params.id, function(res) {
  		res.setEncoding('utf8');
    	res.on('data', function(chunk){
        	response.send(200, chunk)
    	})
	}).on('error', function(e) {
  		response.send(404, e.message)
	})
}