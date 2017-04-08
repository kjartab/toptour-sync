require('./env.js');
var express = require('express');
var passport = require('passport');
var app = express();
var cors = require('cors');
var db = require('./db.js');

app.use(cors())

app.get('/', function(req, res) {
    res.send({ "message": "Welcome to Toptour Sync API" });
});

app.get('/utno/:type', function(req, res) {

    if (!verifyType(req.params.type)) {
        res.sendStatus(404);
    } else {
        var params = req.params;
        if (!params.limit) {
            params.limit = 5;
        }
        console.log(params);
        db.getDocuments(params)
        .then(function(response) {
            res.send(response);
        })
        .catch(function(error) {
            console.log(error);
            res.sendStatus(500);
        });
    }
});

app.get('/utno/:type/:id', function(req, res) {

    if (!verifyType(req.params.type)) {
        res.sendStatus(404);
    } else {
        db.getDocument(req.params)
        .then(function(rows) {
            if (rows.length > 0) {
                res.send(rows[0]);            
            } else {
                res.sendStatus(404);                
            }
        })
        .catch(function(error) {
            res.sendStatus(500);
        });
    }

});


app.post('/jobs/utno/update/:type', function(req, res) {
    var type = req.params.type;
    res.send({"status" : "OK", "processing" : "updating utno: " + type });
});

app.post('/jobs/nve/snow/:type', function(req, res) {
    var type = rseq.params.type;
    res.send({"status" : "OK", "processing" : "updating snow: " + type });
});


function verifyType(type) {
    return ['turer', 'steder', 'bilder', 'grupper'].indexOf(type) > -1; 
}

app.listen(5044);