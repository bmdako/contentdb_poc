var AWS = require('aws-sdk');
AWS.config.update({region: 'eu-west-1'});
var dynamodb = new AWS.DynamoDB();
var markdown = require( 'markdown' ).markdown;
var ansidiff = require('ansidiff');
var dynamoDbTableName = process.env.DYNAMODB_TABLE_NAME;
var helper = require('./helper.js');

module.exports.get = function(request, response) {
    getDynamoDbItem(request.params.id, request.params.version, function (err, data) {
        if (data) {
            if (data.Item) {
                var article = flattenAwsData(data);
                if (request.query.format === 'html')
                {
                    article.content = markdown.toHTML(article.content);
                }
                response.send(200, article);
            } else {
                response.send(404);
            }
        } else {
            response.send(500, err);
        }
    });
};

module.exports.getNodeFromBond = function(request, response) {
    helper.getJson('http://www.b.dk/mecommobile/node/' + request.params.id, function(data) {

        if (data.items === undefined || data.items.length === 0) {
            response.send(404, {'message': 'nothing found'});
        
        } else if (data.items.length > 1) {
            response.send(500, {'message': 'too many nodes found'});

        } else {
            var node = {
                id: data.items[0]['0'].value,
                title: data.items[0].title,
                description: data.items[0].description,
                link: data.items[0].link,
                published: data.items[0].pubDate,
                updated: data.items[0].updated,
                category: data.items[0].category,
                content_type: data.items[0].content_type,
                author: data.items[0].author,
                email: data.items[0].email,
                image: (data.items[0]['1']) ? data.items[0]['1'].attributes : undefined,
                content: data.items[0]['berlingske:content'],
                presentationtags: [],
                related: []
            };

            if (data.items[0].fields) {
                for(var k = 0; k < data.items[0].fields.length; ++k) {
                    switch(data.items[0].fields[k].attributes.keys) {
                        case 'p_tag':
                            node.presentationtags.push(data.items[0].fields[k].value);
                            break;
                    }
                }
            }

            if (data.items[0].related) {
                for(var j = 0; j < data.items[0].related.length; ++j) {
                    node.related.push({
                        id: data.items[0].related[j].value['0'].value,
                        title: data.items[0].related[j].value.title,
                        link: data.items[0].related[j].value.link,
                        category: data.items[0].related[j].value.category
                    });
                }
            }

            response.send(200, node);
        }
    });
};

module.exports.getNodeQueueFromBond = function(request, response) {
    helper.getJson('http://www.b.dk/mecommobile/nodequeue/' + request.params.id, function(data) {
        
        if (data.items === undefined) {
            response.send({'message': 'nothing found'});
        
        } else {
            var nodequeue = [];
            for(var i = 0; i < data.items.length; ++i) {
                if (['news_article'].contains(data.items[i].content_type)) {
                    nodequeue.push({
                        id: data.items[i]['0'].value,
                        title: data.items[i].title,
                        link: data.items[i].link,
                        published: data.items[i].pubDate,
                        //updated: data.items[i].updated,
                        category: data.items[i].category,
                        content_type: data.items[i].content_type,
                        author: data.items[i].author,
                        email: data.items[i].email,
                        image: (data.items[i]['1']) ? data.items[i]['1'].attributes : undefined
                    });
                }
            }

            response.send(nodequeue);
        }
    });
};

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
};

module.exports.save = function(request, response) {
    if (request.body) {
        
        // TODO: Check for current version

        var params = {
            TableName: dynamoDbTableName,
            Item: getItemInserts(request.body)
        };

        if (params.Item.id === undefined || params.Item.id.S === undefined) {
            params.Item.id = { S: guid() };
            params.Item.version = { S: '1' };
        } else {
            // Use update then updating an existing article
            response.send(400);
        }

        dynamodb.putItem(params, function (err, data) {
            if (data) {
                response.send(200, data);
            } else {
                response.send(500, err);
            }
        });
    }
};

module.exports.update = function(request, response) {
    if (request.body) {

        /* Finding the current version of the article */
        var params = {
            TableName: dynamoDbTableName,
            IndexName: 'author-id-index',
            AttributesToGet: ['id', 'version', 'author'],
            KeyConditions: {
                // 'author': {
                //     AttributeValueList: [{ S: "Janus Mulvad" }],
                //     ComparisonOperator: 'EQ'
                // }
                'author': {
                    AttributeValueList: [{ S: "Janus" }],
                    ComparisonOperator: 'BETWEEN'
                }
                // ,
                // 'author': {
                //     AttributeValueList: [{ S: 'Thomas' },],
                //     ComparisonOperator: 'EQ'
                // }
            }
        };

        dynamodb.query(params, function(err, data) {
            if (data) {
                console.log(data)
            } else {
            }
        });


        var params = {
            TableName: dynamoDbTableName,
            Key: { 'id' : { S: request.params.id }, 'version': { S: '1' }},
            AttributeUpdates: getAttributeUpdates(request.body)};

        dynamodb.updateItem(params, function (err, data) {
            if (data) {
                response.send(200, data);
            } else {
                response.send(500, err);
            }
        });
    } else {
        response.send(400);
    }
};

module.exports.delete = function(request, response) {
    var params = {
        TableName: dynamoDbTableName,
        Key: { 'id' : { S : request.params.id }, 'version': { N: '1' }}};

    dynamodb.deleteItem(params, function(err, data) {
        if (data) {
            response.send(200, data);
        } else {
            response.send(500, err);
        }
    });
};

module.exports.scan = function(request, response) {
    var params = {
        TableName: dynamoDbTableName,
        AttributesToGet: ['id', 'title', 'author', 'content', 'version']};

    if (request.params.id) {
        params.ScanFilter = {
            'id': {
                AttributeValueList: [{ S: request.params.id }],
                ComparisonOperator: 'EQ'
            }
        };
    }
    dynamodb.scan(params, function(err, data){
        if (data) {
            if (data.Items.length === 0) {
                response.send(404);
            } else if (data.Items.length === 1) {
                response.send(200, flattenAwsItem(data.Items[0]));
            } else {
                response.send(200, flattenAwsData(data));
            }
        } else {
            response.send(500, err);
        }
    });
};

module.exports.query = function(request, response) {
    var params = {
        TableName: dynamoDbTableName,
        IndexName: 'author-id-index',
        AttributesToGet: ['id', 'version', 'author'],
        KeyConditions: {
            // 'author': {
            //     AttributeValueList: [{ S: "Janus Mulvad" }],
            //     ComparisonOperator: 'EQ'
            // }
            'author': {
                AttributeValueList: [{ S: "Janus" }],
                ComparisonOperator: 'BETWEEN'
            }
            // ,
            // 'author': {
            //     AttributeValueList: [{ S: 'Thomas' },],
            //     ComparisonOperator: 'EQ'
            // }
        }
    };

    dynamodb.query(params, function(err, data) {
        if (data) {
            response.send(200, flattenAwsData(data));
        } else {
            response.send(500, err);
        }
    });
};

module.exports.diff = function(request, response) {
    getDynamoDbItem(request.params.id, '1', function(err, data) {
        var original = flattenAwsData(data);
        var output = {};

        // Doing a diff for all attributes in the new document
        for (var key in request.body) {
            if (original.hasOwnProperty(key)) {
                output[key] = ansidiff.words(
                    markdown.toHTML(original[key]),
                    markdown.toHTML(request.body[key]),
                    htmlDiffColorer);
            } else {
                // If the attributed is completely new, the diff is being made using an empty string as the original
                output[key] = ansidiff.words(
                    '',
                    markdown.toHTML(request.body[key]),
                    htmlDiffColorer);
            }
        }

        // Adding the attributes from the original that have been completely removed from the new document
        for (var key2 in original) {
            if (request.body[key2] === undefined) {
                output[key2] = ansidiff.words(
                    markdown.toHTML(original[key2]),
                    '',
                    htmlDiffColorer);
            }
        }
        response.send(200, output);
    });
};

function getDynamoDbItem(id, version, callback) {
    var params = {
        TableName: dynamoDbTableName,
        Key : { 'id' : { S : id }, 'version' : { S: version }}};

    dynamodb.getItem(params, function (err, data) {
        callback(err, data);
    });
}

function flattenAwsData(data) {
    if (data.Count && data.Items) {
        return flattenAwsItems(data.Items);
    } else if (data.Item) {
        return flattenAwsItem(data.Item);
    } else {
        return {};
    }
}

function flattenAwsItems(items) {
    var temp = [];

    for(var i = 0, bound = items.length; i < bound; ++i) {
        temp.push(flattenAwsItem(items[i]));
    }

    return temp;
}

function flattenAwsItem(item) {
    var temp = { id: item.id.S };
    
    for(var key in item){
        if (item.hasOwnProperty(key)) {
            if (item[key].S) {
                // S — (String)
                // A String data type
                temp[key] = item[key].S;
            } else if (item[key].N) {
                // N — (String)
                // A Number data type
                temp[key] = item[key].N;
            } else if (item[key].B) {
                // B — (Base64 Encoded String)
                // A Binary data type
                temp[key] = item[key].B;
            } else if (item[key].SS) {
                // SS — (Array<String>)
                // A String set data type
                temp[key] = item[key].SS;
            } else if (item[key].NS) {
                // NS — (Array<String>)
                // Number set data type
                temp[key] = item[key].NS;
            } else if (item[key].BS) {
                // BS — (Array<Base64 Encoded String>)
                // A Binary set data type
                temp[key] = item[key].BS;
            }
        }
    }

    return temp;
}

function getItemInserts(body) {
    var ItemInserts = {};
    
    for(var key in body){
        if (body.hasOwnProperty(key)) {
            
            switch (typeof(body[key])) {
                case 'string':
                    if (body[key] === '') {
                    } else {
                        ItemInserts[key] = { S: body[key] };
                    }
                    break;
                case 'number':
                    ItemInserts[key] = { N: body[key] };
                    break;
                case 'B': // TODO (Base64 Encoded String)
                    ItemInserts[key] = { B: body[key] };
                    break;
                case 'object':
                    if (body[key] instanceof Array) {
                        if (body[key].length > 0) {
                            switch (typeof(body[key][0])) {
                                case 'string':
                                    ItemInserts[key] = { SS: body[key] };
                                    break;
                                case 'number':
                                    ItemInserts[key] = { NS: body[key] };
                                    break;
                            }
                        }
                    }
                    break;
                case 'BS': // TODO (Array<Base64 Encoded String>)
                    ItemInserts[key] = { BS: body[key] };
                    break;
                default:
                    ItemInserts[key] = { S: body[key] };
                    break;
            }
        }
    }

    return ItemInserts;
}

function getAttributeUpdates(body) {
    var AttributeUpdates = {};
    
    for(var key in body){
        if (body.hasOwnProperty(key) && key !== 'id' && key !== 'version') {
            
            AttributeUpdates[key] = {};

            switch (typeof(body[key])) {
                case 'string':
                    if (body[key] === '') {
                        AttributeUpdates[key].Action = 'DELETE';
                    } else {
                        AttributeUpdates[key].Value = { S: body[key] };
                    }
                    break;
                case 'number':
                    AttributeUpdates[key].Value = { N: body[key] };
                    break;
                case 'B': // TODO (Base64 Encoded String)
                    AttributeUpdates[key].Value = { B: body[key] };
                    break;
                case 'object':
                    if (body[key] instanceof Array) {
                        if (body[key].length === 0) {
                            AttributeUpdates[key].Action = 'DELETE';
                        } else {
                            switch (typeof(body[key][0])) {
                                case 'string':
                                    AttributeUpdates[key].Value = { SS: body[key] };
                                    break;
                                case 'number':
                                    AttributeUpdates[key].Value = { NS: body[key] };
                                    break;
                            }
                        }
                    }
                    break;
                case 'BS': // TODO (Array<Base64 Encoded String>)
                    AttributeUpdates[key].Value = { BS: body[key] };
                    break;
                default:
                    AttributeUpdates[key].Value = { S: body[key] };
                    break;
            }
        }
    }

    return AttributeUpdates;
}

function guid() {
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
    return uuid;
}

function htmlDiffColorer(obj) {
    if (obj.added) {
        return '<span class="added">' + obj.value + '</span>';
    } else if (obj.removed) {
        return '<span class="removed">' + obj.value + '</span>';
    } else {
        return obj.value;
    }
}

function markdownDiffColorer(obj) {
    if (obj.added) {
        return '**' + obj.value + '**';
    } else if (obj.removed) {
        return '**' + obj.value + '**';
    } else {
        return obj.value;
    }
}