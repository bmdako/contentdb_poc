var express = require("express")
var app = express()
app.use(express.logger())
app.use(express.bodyParser())

var repository = require('./core/repository.js')
var markdown = require( "markdown" ).markdown

app.use("/", express.static("./client"))

// app.get('/', function(request, response) {
//     response.sendfile('./client/index.html')
// })

app.get("/articles", function(request, response){
	repository.scanArticles(function(err, data){
		if (data) {
	    	response.send(200, data)
	    } else {
	    	response.send(500, err)
	    }
	})
})

app.get('/json/:id', function(request, response) {
	repository.getArticle(request.params.id, function(err, data){
		if (data) {
	    	response.send(200, data)
	    } else {
	    	response.send(500, err)
	    }
	})
})

app.get('/:id', function(request, response) {
	//response.send(501)
	repository.getArticle(request.params.id, function(err, data) {
		if (data && data.tekst) { // So favicon.ico doens't get markdown'ed
	    	response.send(200, markdown.toHTML(data.tekst))
	    } else {
	    	response.send(500, err)
	    }
	})
})

app.post('/', function(request, response) {
	if (request.body) {
		repository.saveArticle(request.body, function(err, data) {
			if (data) {
				response.send(200, data)
			} else {
				response.send(500, err)
			}
		})
	} else {
		response.send(400)
	}
})

app.put("/:id", function(request, response) {
	if (request.body) {
		repository.updateArticle(request.params.id, request.body, function(err, data){
			if (data) {
				response.send(200, data)
			} else {
				response.send(500, err)
			}
		})
	} else {
		response.send(400)
	}
})

app.delete("/:id", function(request, response){
	repository.deleteArticle(request.params.id, function(err, data) {
		if (data) {
			response.send(200, data)
		} else {
			response.send(500, err)
		}
	})
})

var port = process.env.PORT || 5000
app.listen(port, function() {
	console.log('Server running at http://127.0.0.1:' + port + '/')
})
