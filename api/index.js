require('./env.js')
var express = require('express');
var passport = require('passport');
var app = express();
var db = require('./db.js');

var toptourProcessing = require('./toptour-processing.js');

var passport = require('passport')
var FacebookStrategy = require('passport-facebook').Strategy;

// passport.use(new FacebookStrategy({
//     clientID: process.env['FACEBOOK_APP_ID'],
//     clientSecret: process.env['FACEBOOK_APP_SECRET'],
//     callbackURL: "http://localhost:5043/auth/facebook/callback"
//   },
//   function(accessToken, refreshToken, profile, done) {
//     User.findOrCreate(..., function(err, user) {
//       if (err) { return done(err); }
//       done(null, user);
//     });
//   }
// );

app.get('/', function(req, res) {
    res.send("Toptour API");
});

app.get('/:type', function(req, res) {

    var type = req.params.type;

    if (verifyType(type)) {

        db.getDocuments(type)
        .then(function(response) {
            res.send(response);
        })
        .catch(function(error) {
            res.sendStatus(500);
        });

    } else {
        res.sendStatus(404);
    }
});


app.post('/jobs/utno/:type', function(req, res) {
    var type = req.params.type;

    if (verifyType(type)) {
        toptourProcessing.
    }
});


function verifyType(type) {
    return ['turer', 'steder', 'bilder', 'grupper'].indexOf(type) > -1; 
}

app.listen(5043);