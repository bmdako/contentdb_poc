var http = require('http')

module.exports.get = get

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

module.exports.getJson = function(url, callback) {
    
    console.log(url)

    get(url, function(data) {
        // try {
        //     console.log("done")
            callback(JSON.parse(data))
        // } catch (err) {
        //     console.log("err")
        //     callback(err)
        // }
    })
}