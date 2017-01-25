var kue = require('kue');

var utnoQueue = kue.createQueue({
  "prefix": "toptourUtno",
  "redis": {
    "host": "127.0.0.1"
  }
});


var utno