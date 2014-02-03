var express = require('express')
var app = express()
app.use(express.logger())
app.use(express.bodyParser())
app.use(express.favicon())
app.use('/', express.static('./client'))

var repository = require('./core/repository.js')
var site = require('./core/site.js')

app.get('/', site.visForside)
app.get('/editor', function(request, response){
	response.sendfile('./client/editor.html')
})

app.get('/:id', site.visArtikel)
app.get('/artikel/:id', site.visArtikel)
app.get('/sektion/*', site.visSektion)
app.get('/api/scan', repository.scan)
app.get('/api/query', repository.query)
app.get('/api/:id', repository.get)
app.get('/api/node/:id', repository.getNodeFromBond)
app.get('/api/nodequeue/:id', repository.getNodeQueueFromBond)
app.post('/api', repository.save)
app.put('/api/diff/:id', repository.diff)
app.put('/api/:id', repository.update)
app.delete('/api/:id', repository.delete)

var port = process.env.PORT || 5000
app.listen(port, function() {
	console.log('Server running at http://127.0.0.1:' + port + '/')
}).on('error', function(e){
	console.log(e)
})
