var AWS = require('aws-sdk')
AWS.config.loadFromPath('./config/aws.config')
var dynamodb = new AWS.DynamoDB()

module.exports.getArticle = function(id, callback) {
    var params = {
        TableName: "contentdb_poc",
        Key : { "Article ID" : {"S" : id }}}

    dynamodb.getItem(params, function (err, data) {
        if (data) {
            if (data.Item) {
                var article = {
                    id: data.Item["Article ID"].S,
                    tekst: data.Item.Article.S,
                    supertitel: "",
                    rubrik: "",
                    summary: "",
                    primaryTerm: "",
                    topicPages: "",
                    presentationTags: "",
                    prisAbonnement: ""
                }
                callback(undefined, article)
            } else {
                callback(undefined, data)
            }
        } else {
            callback(err, undefined)
        }
    })
}

module.exports.getArticleMarkdown = function(id, callback) {
    callback("Not implemented", undefined)
}

module.exports.getArticleHtml = function(id, callback) {
    callback("Not implemented", undefined)
}

module.exports.saveArticle = function(article, callback) {
    var id = guid()
    var params = {
        TableName: "contentdb_poc",
        Item: {
            "Article ID" : {"S" : id },
            "Article": {"S" : article }}}

    dynamodb.putItem(params, function (err, data) {
        callback(err, data)
    })
}

module.exports.updateArticle = function(id, article, callback) {
    var params = {
        TableName: "contentdb_poc",
        Key: { "Article ID" : {"S" : id } },
        AttributeUpdates: {"Article": {Value: {"S" : article }}, "Title": {Value:{"S": "For vild"}}}}

    dynamodb.updateItem(params, function (err, data) {
        callback(err, data)
    })
}

module.exports.deleteArticle = function(id, callback) {
    var params = {
        TableName: "contentdb_poc",
        Key: { "Article ID" : {"S" : id } }}

    dynamodb.deleteItem(params, function(err, data){
        callback(err, data)
    })
}

module.exports.scanArticles = function(callback) {
    var params = {
        TableName: "contentdb_poc"
    }

    dynamodb.scan(params, function(err, data){
        callback(err, data)
    })
}

function guid() {
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8)
        return v.toString(16)
    })
    return uuid
}