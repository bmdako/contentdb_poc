var AWS = require('aws-sdk')
AWS.config.loadFromPath('./config/aws.config')
var dynamodb = new AWS.DynamoDB()
var markdown = require( "markdown" ).markdown

module.exports.getArticle = function(request, response) {
    var params = {
        TableName: "contentdb_poc",
        Key : { "Article ID" : {"S" : request.params.id }}}

    dynamodb.getItem(params, function (err, data) {
        if (data) {
            if (data.Item) {
                response.send(200, {
                    id: data.Item["Article ID"].S,
                    tekst: data.Item.Tekst ? data.Item.Tekst.S : "",
                    supertitel: data.Item.Supertitel ? data.Item.Supertitel.S : "",
                    rubrik: data.Item.Rubrik ? data.Item.Rubrik.S : "",
                    summary: data.Item.Summary ? data.Item.Summary.S : "",
                    primaryTerm: data.Item.PrimaryTerm ? data.Item.PrimaryTerm.S : "",
                    topicPages: data.Item.TopicPages ? data.Item.TopicPages.S : "",
                    presentationTags: data.Item.PresentationTags ? data.Item.PresentationTags.S : "",
                    prisAbonnement: data.Item.PrisAbonnement ? data.Item.PrisAbonnement.S : ""
                })
            } else {
                response.send(200, data)
            }
        } else {
            response.send(500, err)
        }
    })
}

module.exports.getArticleMarkdown = function(request, response) {
    response.send(501)
    //markdown.toHTML(data.tekst)
}

module.exports.getArticleHtml = function(request, response) {
    response.send(501)
}

module.exports.saveArticle = function(request, response) {
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

module.exports.updateArticle = function(request, response) {
    if (request.body) {
        var params = {
            TableName: "contentdb_poc",
            Key: { "Article ID" : {"S" : request.params.id } },
            AttributeUpdates: {
                "Tekst": {Value: {"S" : request.body.tekst }},
                "Supertitel": {Value: {"S": request.body.supertitel}},
                "Rubrik": {Value: {"S": request.body.rubrik}},
                "Summary": {Value: {"S": request.body.summary}},
                "PrimaryTerm": {Value: {"S": request.body.primaryTerm}},
                "TopicPages": {Value: {"S": request.body.topicPages}},
                "PresentationTags": {Value: {"S": request.body.presentationTags}},
                "PrisAbonnement": {Value: {"S": request.body.prisAbonnement}}}}

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

module.exports.deleteArticle = function(request, response) {
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

module.exports.scanArticles = function(request, response) {
    var params = {
        TableName: "contentdb_poc"
    }

    dynamodb.scan(params, function(err, data){
        if (data) {
            var temp = []
            for(var i = 0, bound = data.Count; i < bound; ++i) {
                temp.push({
                    id: data.Items[i]["Article ID"].S,
                    tekst: data.Items[i].Tekst ? data.Items[i].Tekst.S : "",
                    supertitel: data.Items[i].Supertitel ? data.Items[i].Supertitel.S : "",
                    rubrik: data.Items[i].Rubrik ? data.Items[i].Rubrik.S : "",
                    summary: data.Items[i].Summary ? data.Items[i].Summary.S : "",
                    primaryTerm: data.Items[i].PrimaryTerm ? data.Items[i].PrimaryTerm.S : "",
                    topicPages: data.Items[i].TopicPages ? data.Items[i].TopicPages.S : "",
                    presentationTags: data.Items[i].PresentationTags ? data.Items[i].PresentationTags.S : "",
                    prisAbonnement: data.Items[i].PrisAbonnement ? data.Items[i].PrisAbonnement.S : ""
                })
            }
            response.send(200, temp)
        } else {
            response.send(500, err)
        }
    })
}

function guid() {
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8)
        return v.toString(16)
    })
    return uuid
}