var express = require("express")
var app = express()
app.use(express.logger())
app.use(express.bodyParser())
app.use(express.favicon())
app.use("/", express.static("./client"))


var repository = require('./core/repository.js')
var site = require('./core/site.js')

app.get("/", site.visForside)
app.get('/:id', site.visArtikel)
app.get('/artikel/:id', site.visArtikel)
app.get('/sektion/*', site.visSektion)
app.get('/raw/:id', site.visRaaArtikel)
app.get("/api/article/scan", repository.scan)
app.get('/api/article/json/:id', repository.get)
app.get('/api/article/:id', repository.getMarkdown)
app.post('/api/article', repository.save)
app.put("/api/article/:id", repository.update)
app.delete("/api/article/:id", repository.delete)

var port = process.env.PORT || 5000
app.listen(port, function() {
	console.log('Server running at http://127.0.0.1:' + port + '/')
}).on('error', function(e){
	console.log(e)
})
