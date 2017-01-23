var kue = require('kue');
var toptour = require('./toptour.js');
var weather = require('./weatherConditions.js');

var queue = kue.createQueue({
  "prefix": "utno",
  "redis": {
    "host": "127.0.0.1"
  }
});


queue.process("handleUpdates", 2, function(job, done) {

    var type = job.data.documentType;

    toptour.handleUpdates(type)
    .then(done);
    .catch(new Error("something went wrong"));

});


queue.process("updateConditions", 1, function(job, done) {

    weather.updateSnowCover()
    .then(done)
    .catch(function(error) { console.log(error); });

});

queue.process("updateTourConditions", 50, function(job, done) {

    toptour. 
    # var tourId = job.data.id;
    # var boundingBox = job.data.bbox;
  

});



queue.process("updateElasticsearch", 1, function(job, done) {

});