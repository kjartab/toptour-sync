require('./env.js');
var pg = require('pg')
var QueryStream = require('pg-query-stream') 
var elasticsearch = require('elasticsearch');
var split = require('split');
var stringify =  require('stringify-stream');

var esclient = new elasticsearch.Client( {  
  hosts: [
    'http://elastic:changeme@10.0.0.125:9200'
  ]
});

var bulks = {};
var counter = 0;

function upsertAllDocuments(type) {

    bulks[type] = [];
    var body = bulks[type];

    pg.connect(function(err, client, done) {
        if(err) throw err;

        var query = new QueryStream('SELECT id, attribs FROM utno.' + type + ' LIMIT $1', [19000], { batchSize: 1})
        var stream = client.query(query)

        stream.on('end', function() {
            done();
            console.log("body length: ", type, body.length/2);
            esclient.bulk({
                body: body
            }, function (err, resp) {
                console.log("insterted", type,  body.length/2);
                console.log("last")
            });
        });
     
        stream.pipe(stringify()).pipe(split(JSON.parse, "\r\n")).on('data', function (row) {
                //each chunk now is a seperate line!
                body.push({ update: { _id: row.id, _index: "utno", _type: type } });
                body.push({"doc_as_upsert":true, "doc": row});

                counter++;
                // console.log(counter);
                if (counter % 100 == 0) {
                    stream.pause();
                    console.log("body length - not done: ", type,  body.length/2);
                    // console.log(body);
                    esclient.bulk({
                        body: body
                    }, function (err, resp) {
                        console.log("inserted - not done", type, body.length/2);
                        body = [];
                        console.log("inserted - not done", type, body.length/2);
                        stream.resume();
                    });
                }
        });
    });

}

function upsertDocuemnt(type, id) {

}

function deleteIndex(type) {

}

function deleteDocument(type, id) {

    esclient.delete({
        index: 'myindex',
        type: 'mytype',
        id: '1'
    }, function (error, response) { 

    });
}


upsertAllDocuments("turer");
// upsertAllDocuments("grupper");

// module.exports = {
//     upsertDocuments : upsertDocuments,
//     upsertDocument : upsertDocument,
//     deleteDocuments : deleteDocuments,
//     deleteDocument : deleteDocument
// }