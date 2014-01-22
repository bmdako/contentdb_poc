var express = require("express")
var app = express()
app.use(express.logger())
app.use(express.bodyParser())
app.use(express.favicon())

var Bliss = require('bliss')
var bliss = new Bliss()

var repository = require('./core/repository.js')
var site = require('./core/site.js')

app.use("/", express.static("./client"))

app.get('/test', function(request, response) {
	response.send(bliss.render(
		'templates/orders',
		{name: "test"},
		[{title: "1"}, {title:"2"}]))
})

app.get('/:id', site.showArticle)

app.get("/api/article/scan", repository.scanArticles)
app.get('/api/article/json/:id', repository.getArticle)
app.get('/api/article/:id', repository.getArticleMarkdown)
app.post('/api/article', repository.saveArticle)
app.put("/api/article/:id", repository.updateArticle)
app.delete("/api/article/:id", repository.deleteArticle)

var port = process.env.PORT || 5000
app.listen(port, function() {
	console.log('Server running at http://127.0.0.1:' + port + '/')
})
