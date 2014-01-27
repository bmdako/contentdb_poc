var AWS = require('aws-sdk')
AWS.config.loadFromPath('./config/aws.config')
var dynamodb = new AWS.DynamoDB()
var markdown = require( "markdown" ).markdown

module.exports.get = function(request, response) {
    var params = {
        TableName: "contentdb_poc",
        Key : { "Article ID" : {"S" : request.params.id }}}

    dynamodb.getItem(params, function (err, data) {
        if (data) {
            if (data.Item) {
                var a = flattenAwsItem(data.Item)
                if (request.query.format === 'markdown')
                {
                    a['Tekst'] = markdown.toHTML(a['Tekst'])
                }
                response.send(200, a)
            } else {
                response.send(200, data)
            }
        } else {
            response.send(500, err)
        }
    })
}

module.exports.save = function(request, response) {
    response.send(501)
    // var id = guid()
    // var params = {
    //     TableName: "contentdb_poc",
    //     Item: {
    //         "Article ID" : {"S" : id },
    //         "Article": {"S" : article }}}

    // dynamodb.putItem(params, function (err, data) {
    //     if (data) {
    //         response.send(200, data)
    //     } else {
    //         response.send(500, err)
    //     }
    // })
}

module.exports.update = function(request, response) {
    if (request.body) {
        var params = {
            TableName: "contentdb_poc",
            Key: { "Article ID" : {"S" : request.params.id } },
            AttributeUpdates: getAttributeUpdates(request.body)}

        dynamodb.updateItem(params, function (err, data) {
            if (data) {
                response.send(200, data)
            } else {
                response.send(500, err)
            }
        })
    } else {
        response.send(400)
    }
}

module.exports.delete = function(request, response) {
    var params = {
        TableName: "contentdb_poc",
        Key: { "Article ID" : {"S" : request.params.id } }}

    dynamodb.deleteItem(params, function(err, data){
        if (data) {
            response.send(200, data)
        } else {
            response.send(500, err)
        }
    })
}

module.exports.scan = function(request, response) {
    var params = {
        TableName: "contentdb_poc",
        AttributesToGet: ["Article ID", "Rubrik", "Tekst"],
        ScanFilter: {}
    }

    dynamodb.scan(params, function(err, data){
        if (data) {
            var temp = []
            for(var i = 0, bound = data.Count; i < bound; ++i) {
                temp.push(flattenAwsItem(data.Items[i]))
            }
            response.send(200, temp)
        } else {
            response.send(500, err)
        }
    })
}

function flattenAwsItem(item) {
    var temp = {}
    temp.id = item["Article ID"].S // Legacy
    for(var key in item){
        if (item.hasOwnProperty(key)) {
            if (item[key].S) {
                // S — (String)
                // A String data type
                temp[key] = item[key].S
            } else if (item[key].N) {
                // N — (String)
                // A Number data type
                temp[key] = item[key].N
            } else if (item[key].B) {
                // B — (Base64 Encoded String)
                // A Binary data type
                temp[key] = item[key].B
            } else if (item[key].SS) {
                // SS — (Array<String>)
                // A String set data type
                temp[key] = item[key].SS
            } else if (item[key].NS) {
                // NS — (Array<String>)
                // Number set data type
                temp[key] = item[key].NS
            } else if (item[key].BS) {
                // BS — (Array<Base64 Encoded String>)
                // A Binary set data type
                temp[key] = item[key].BS
            }
        }
    }
    return temp
}

function getAttributeUpdates(item) {
    var AttributeUpdates = {}
    for(var key in item){
        if (item.hasOwnProperty(key) && key !== 'id' && key !== 'Article ID') {
            AttributeUpdates[key] = { Value: {}}
            switch(typeof(item[key])) {
                case 'string':
                    AttributeUpdates[key].Value.S = item[key]
                    break
                case 'number':
                    AttributeUpdates[key].Value.N = item[key]
                    break
                case 'B': // TODO
                    AttributeUpdates[key].Value.B = item[key]
                    break
                case 'SS': // TODO
                    AttributeUpdates[key].Value.SS = item[key]
                    break
                case 'NS': // TODO
                    AttributeUpdates[key].Value.NS = item[key]
                    break
                default:
                    AttributeUpdates[key].Value.S = item[key]
                    break
            }
        }
    }
    return AttributeUpdates
}

function guid() {
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8)
        return v.toString(16)
    })
    return uuid
}