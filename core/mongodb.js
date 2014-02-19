var MongoClient = require('mongodb').MongoClient
  , Server = require('mongodb').Server;

//127.0.0.1:49255
var mongoClient = new MongoClient(new Server('localhost', 49255));
mongoClient.open(function(err, mongoClient) {
  var db1 = mongoClient.db("mydb");

  mongoClient.close();
});