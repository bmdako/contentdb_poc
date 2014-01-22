var express = require("express")
var app = express()
app.use(express.logger())
app.use(express.bodyParser())
app.use(express.favicon())


var repository = require('./core/repository.js')
var site = require('./core/site.js')

app.use("/", express.static("./client"))
app.get("/", site.showMainPage)
app.get('/:id', site.showArticle)
app.get('/raw/:id', site.showRawArticle)
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
