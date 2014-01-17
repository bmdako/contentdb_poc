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
                    tekst: data.Item.Tekst.S,
                    supertitel: data.Item.Supertitel.S,
                    rubrik: data.Item.Rubrik.S,
                    summary: data.Item.Summary.S,
                    primaryTerm: data.Item.PrimaryTerm.S,
                    topicPages: data.Item.TopicPages.S,
                    presentationTags: data.Item.PresentationTags.S,
                    prisAbonnement: data.Item.PrisAbonnement.S
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

module.exports.saveArticle = function(body, callback) {
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

module.exports.updateArticle = function(id, body, callback) {
    var params = {
        TableName: "contentdb_poc",
        Key: { "Article ID" : {"S" : body.id } },
        AttributeUpdates: {
            "Tekst": {Value: {"S" : body.tekst }},
            "Supertitel": {Value: {"S": body.supertitel}},
            "Rubrik": {Value: {"S": body.rubrik}},
            "Summary": {Value: {"S": body.summary}},
            "PrimaryTerm": {Value: {"S": body.primaryTerm}},
            "TopicPages": {Value: {"S": body.topicPages}},
            "PresentationTags": {Value: {"S": body.presentationTags}},
            "PrisAbonnement": {Value: {"S": body.prisAbonnement}}}}

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