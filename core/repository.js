var AWS = require('aws-sdk')
AWS.config.update({region: 'eu-west-1'})
var dynamodb = new AWS.DynamoDB()
var markdown = require( "markdown" ).markdown
var ansidiff = require('ansidiff')
var dynamoDbTableName = 'contentdb_poc'

module.exports.get = function(request, response) {
    var params = {
        TableName: dynamoDbTableName,
        Key : { "Article ID" : {"S" : request.params.id }}}

    dynamodb.getItem(params, function (err, data) {
        if (data) {
            if (data.Item) {
                var article = flattenAwsData(data)
                if (request.query.format === 'html')
                {
                    article['Tekst'] = markdown.toHTML(article['Tekst'])
                }
                response.send(200, article)
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
    //     TableName: dynamoDbTableName,
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
            TableName: dynamoDbTableName,
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
        TableName: dynamoDbTableName,
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
        TableName: dynamoDbTableName,
        AttributesToGet: ["Article ID", "Rubrik", "Tekst"],
        ScanFilter: {}
    }

    dynamodb.scan(params, function(err, data){
        if (data) {
            response.send(200, flattenAwsData(data))
        } else {
            response.send(500, err)
        }
    })
}

module.exports.query = function(request, response) {
    var params = {
        TableName: dynamoDbTableName,
        AttributesToGet: ["Article ID", "Rubrik", "Tekst"],
        //IndexName: "Article ID",
        KeyConditions: {
            'Article ID': {
                AttributeValueList: '',
                ComparisonOperator: 'Russiske'
            }
        }
    }

    dynamodb.query(params, function(err, data){
        if (data) {
            response.send(200, flattenAwsData(data))
        } else {
            response.send(500, err)
        }
    })
}

module.exports.diff = function(request, response) {
    getItem(request.params.id, function(err, data) {
        var original = flattenAwsData(data)
        var output = {}

        // Doing a diff for all attributes in the new document
        for (key in request.body) {
            if (original.hasOwnProperty(key)) {
                output[key] = ansidiff.words(
                    markdown.toHTML(original[key]),
                    markdown.toHTML(request.body[key]),
                    htmlDiffColorer)
            } else {
                // If the attributed is completely new, the diff is being made using an empty string as the original
                output[key] = ansidiff.words(
                    "",
                    markdown.toHTML(request.body[key]),
                    htmlDiffColorer)
            }
        }

        // Adding the attributes from the original that have been completely removed from the new document
        for (key in original) {
            if (request.body[key] === undefined) {
                output[key] = ansidiff.words(
                    markdown.toHTML(original[key]),
                    "",
                    htmlDiffColorer)
            }
        }
        response.send(200, output)
    })
}

function getItem(id, callback) {
    var params = {
        TableName: dynamoDbTableName,
        Key : { "Article ID" : {"S" : id }}}

    dynamodb.getItem(params, function (err, data) {
        callback(err, data)
    })
}

function flattenAwsData(data) {
    if (data.Count && data.Items) {
        return flattenAwsItems(data.Items)
    } else if (data.Item) {
        return flattenAwsItem(data.Item)
    } else {
        return {}
    }
}

function flattenAwsItems(items) {
    var temp = []

    for(var i = 0, bound = items.length; i < bound; ++i) {
        temp.push(flattenAwsItem(items[i]))
    }

    return temp
}

function flattenAwsItem(item) {
    var temp = { id: item["Article ID"].S}
    
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

function getAttributeUpdates(body) {
    var AttributeUpdates = {}
    
    for(var key in body){
        if (body.hasOwnProperty(key) && key !== 'id' && key !== 'Article ID') {
            
            AttributeUpdates[key] = {}
            
            switch(typeof(body[key])) {
                case 'string':
                    if (body[key] === '') {
                        AttributeUpdates[key].Action = 'DELETE'
                    } else {
                        AttributeUpdates[key].Value = {S: body[key]}
                    }
                    break
                case 'number':
                    AttributeUpdates[key].Value = {N: body[key]}
                    break
                case 'B': // TODO
                    AttributeUpdates[key].Value = {B: body[key]}
                    break
                case 'SS': // TODO
                    AttributeUpdates[key].Value = {SS: body[key]}
                    break
                case 'NS': // TODO
                    AttributeUpdates[key].Value = {NS: body[key]}
                    break
                default:
                    AttributeUpdates[key].Value = {S: body[key]}
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

function htmlDiffColorer(obj) {
    if (obj.added) {
        return '<span class="added">' + obj.value + '</span>'
    } else if (obj.removed) {
        return '<span class="removed">' + obj.value + '</span>'
    } else {
        return obj.value
    }
}

function markdownDiffColorer(obj) {
    if (obj.added) {
        return '**' + obj.value + '**'
    } else if (obj.removed) {
        return '**' + obj.value + '**'
    } else {
        return obj.value
    }
}