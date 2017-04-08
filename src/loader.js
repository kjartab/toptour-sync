require('./env.js');
var express = require('express');
var passport = require('passport');
var app = express();
var cors = require('cors');
var db = require('./db.js');
var elasticsearch = require('elasticsearch');


var params = {
    type : "turer"
    // limit : 14000
}
var client = new elasticsearch.Client( {  
  hosts: [
    'http://localhost:9400'
  ]
});

db.getDocuments(params).then(function(data) {
    bulkLoad(data);
});

function bulkLoad(rows) {

    var i=0;
    var n = rows.length;

    function loadRows(rows, callback, i, n) {
        var body = [];

        var start = i;
        while(i < start+10 && i<n) {
            body.push({ index: { _id: rows[i]._id, _index: "utno", _type: "turer" } });
            body.push(rows[i]);
            i++;
        }
        
        client.bulk({
            body: body
        }, function (err, resp) {
            if (i<n) {
                callback(rows, callback, i, n);
                console.log("callback");
            } else {
                console.log("no callback");
            }
        });

    }

    loadRows(rows, loadRows, i, n);
}