var express = require("express")
var app = express()
app.use(express.logger())
app.use(express.bodyParser())

var repository = require('./core/repository.js')
var markdown = require( "markdown" ).markdown

app.use("/", express.static("./static"))

app.get('/', function(request, response) {
    response.sendfile('./web/index.html')
})

app.get('/editor', function(request, response) {
    response.sendfile('./web/ghostdown.html')
})

app.get('/editor/:id', function(request, response) {
	//TODO: Load the article into the editor
    response.sendfile('./web/ghostdown.html')
})

app.get("/articles", function(request, response){
	repository.scanArticles(function(data){
		response.send(data)
	})
})

app.get('/raw/:id', function(request, response) {
	repository.getArticle(request.params.id, function(data){
		if (data !== undefined && data.Article.S !== undefined) {
	    	response.send(200, data.Article.S)
	    } else {
	    	response.send(404)
	    }
	})
})

app.get('/json/:id', function(request, response) {
	repository.getArticle(request.params.id, function(data){
		if (data !== undefined) {
	    	response.send(200, data)
	    } else {
	    	response.send(404)
	    }
	})
})

app.get('/:id', function(request, response) {
	repository.getArticle(request.params.id, function(data) {
		if (data !== undefined && data.Article.S !== undefined) {
	    	response.send(200, markdown.toHTML(data.Article.S))
	    } else {
	    	response.send(404)
	    }
	})
})

app.post('/', function(request, response) {
	if (request.body.article) {
		repository.saveArticle(request.body.article, function(data) {
			response.send(200, data)
		})
	} else {
		response.send(400)
	}
})

app.put("/:id", function(request, response) {
	if (request.body.article) {
		repository.updateArticle(request.params.id, request.body.article, function(data){
			response.send(200, data)
		})
	} else {
		response.send(400)
	}
})

var port = process.env.PORT || 5000
app.listen(port, function() {
	console.log('Server running at http://127.0.0.1:' + port + '/')
})
