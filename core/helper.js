var http = require('http')

module.exports.get = get

module.exports.getJson = function(url, callback) {
    get(url, function(data) {
        callback(JSON.parse(data))
    })
}

function get(url, callback){

    http.get(url, function(response) {

        var body = '';

        response.setEncoding('utf8')

        response.on('data', function(chunk){
            body += chunk;
        })
        .on('end', function() {
            callback(body)
        })
    })
}
