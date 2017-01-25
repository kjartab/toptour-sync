const utApi = require('./utApi.js');
const utDb = require('./db.js');


function updateDocument(type, id) {
    return new Promise(function(resolve, reject) {

        utApi.getDocument(type, id)
        .then(function(response) {
            utDb.updateDocument(type, id, response)
            .then(resolve)
            .catch(reject);
        })
        .catch(reject);

    });
}

function insertDocument(type, id) {
    return new Promise(function(resolve, reject) {

        utApi.getDocument(type, id)
        .then(function(response) {
            utDb.insertDocument(type, id, response)
            .then(resolve)
            .catch(reject);
        })
        .catch(handleError);
    });
}


function checkUpdates(type, documents) {

    return new Promise(function(resolve, reject) {

        var ids = documents.map(doc => doc['_id']);

        if (ids.length == 0) {
            return;
        }

        utDb.getDocumentsByIds(type, ids)
        .then(function(rows) {

            var newDocs = [];
            var oldDocs = [];

            if (rows.length > 0) {

                for (let update of documents) {
                    var found = false;
                    for (let row of rows) {
                        if (update['_id'] == row['id']) {
                            found = true;
                            if (update['endret'] != row['attribs']['endret']) {
                                // The document must be updated
                                oldDocs.push(update);
                            }
                        }
                    }
                    if (!found) {
                        // The document does not exist in database
                        newDocs.push(update);
                    }
                }
            } else {
                newDocs = documents;
            }

            var getAndUpsert = [];

            for (let update of newDocs) {
                getAndUpsert.push(insertDocument(type, update['_id']));
            }

            for (let update of oldDocs) {
                getAndUpsert.push(updateDocument(type, update['_id']));
            }
            console.log(getAndUpsert, "getandupsert");
            if (getAndUpsert.length == 0) {
                resolve();
            } else {
                Promise.all(getAndUpsert).then(resolve);
            }

        }, function(error) {
            reject(error);
        });

    });

}

function updateSnowCover(id) {

}


function handleUpdates(type, parameters) {

    parameters = parameters || { after : '2017-01-11T00:00:38', limit : 50, skip : 0 };
    // var parameters = parameters || { after : '2017-01-18T00:00:38', limit : 50, skip : 0 };

    Promise.resolve()
    .then(function() {
        return parameters;
    })
    .then(
        function fetchAndHandle(parameters) {

            var fetchHandlePromise = new Promise(function(resolve, reject) {

                // Get the documents from nasjonal turbase API
                utApi.getDocuments(type, parameters)
                .then(
                    function(response) {
                        var resp = JSON.parse(response);
                        var docs = resp['documents'];
                        parameters['skip'] += docs.length;
                        
                        return checkUpdates(type, docs);
                    }
                ).then(
                    function(response) {
                        fetchAndHandle(parameters);                        
                    }
                ).catch(function(error) {
                    console.log(error);
                    return;
                });
            });

            return fetchHandlePromise;
                        
        }
    );
}

function handleError(error) {
    if (error.type == 'http') {
        console.log(error.statusCode, error.statusMessage)

    }
    console.log(error);
}

utDb.createGeomJsonbTable("turer");
utDb.createGeomJsonbTable("omrader");
utDb.createGeomJsonbTable("steder");
utDb.createGeomJsonbTable("bilder");
utDb.createGeomJsonbTable("grupper");


handleUpdates("turer");
// handleUpdates("grupper");
// handleUpdates("bilder");
// handleUpdates("steder");
