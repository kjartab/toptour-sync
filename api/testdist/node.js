var kue = require('kue');

//Same queue as we use in the worker
var queue = kue.createQueue({
  "prefix": "test",
  "redis": {
    "host": "127.0.0.1"
  }
});

//as a sample client will create 10 tasks for file download
var filesToDownload = 1000;

//counter to know when all jobs saved to Redis so client can exit
var enqueued = 0;

//event handler. Called when job is saved to the Redis.
queue.on('job enqueue', function(){
    enqueued++;
    // Exit client when everything is saved
    if(enqueued === filesToDownload){
      process.exit(0);
    }
  });

//create 10 download jobs
for(var i=1;i<=filesToDownload;i++){
  queue.create('download', {
    url: 'http://example.org/document-'+i+'.pdf'
  })
  .removeOnComplete(true)
  .save()
}