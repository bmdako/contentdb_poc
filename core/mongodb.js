var MongoClient = require('mongodb').MongoClient
  , Server = require('mongodb').Server;
var mongoClient = new MongoClient(new Server('localhost', 27017));

module.exports.test = function(request, response) {
	mongoClient.open(function(err, mongoClient) {
		if (err) {
			response.send(505, err);
		}

	  	var db1 = mongoClient.db("test");
	  	db1.collection("unicorns").find().toArray(function(err, docs) {
	  		mongoClient.close();
    		response.send(200, docs);
	  	});

	});
};