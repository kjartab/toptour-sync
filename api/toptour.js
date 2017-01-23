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

        var ids = documents.map(function(doc) {
            return doc['_id'];
        });

        var docsDbPromise = utDb.getDocumentsByIds(type, ids);
        console.log("get docs for ids", ids);
        docsDbPromise.then(function(response) {

            var rows = response;
            var newDocs = [];
            var oldDocs = [];

            if (rows.length > 0) {

                for (let update of documents) {
                    var found = false;
                    for (let row of rows) {
                        if (update['_id'] == row['id']) {
                            if (update['endret'] == row['attribs']['endret']) {
                                // The document version already exists
                                found = true;
                            } else {
                                // The document must be updated
                                oldDocs.push(update);
                            }
                        }
                    }
                    if (!found) {
                        newDocs.push(update);
                    }
                }
            } else {
                newDocs = documents;
            }

            // Handle the update, update documents
            var getAndUpsert = [];

            console.log("fire off newdocs, olddocs", newDocs.length, oldDocs)  

            for (let update of newDocs) {
                getAndUpsert.push(insertDocument(type, update['_id'])
                .then(function(response) {console.log(response);})
                .catch(function(error) {console.log(error); }));
            }

            for (let update of oldDocs) {
                getAndUpsert.push(updateDocument(type, update['_id'])
                .then(function(response) {console.log(response);})
                .catch(function(error) {console.log(error); }));
            }

            if (getAndUpsert.length == 0) {
                // No actions
                resolve();
            
            } else {
                // Wait for all promises to finish up, then resolve
                Promise.all(getAndUpsert, function(response) {
                    resolve();
                },
                function (error) {
                    reject(error);
                });

            }

        }, function(error) {
            reject(error);
        });

    });

}

function updateSnowCover(id) {

}


function handleUpdates(type, parameters) {

    parameters = parameters || { after : '2000-01-01T00:00:38', limit : 50, skip : 0 };
    // var parameters = parameters || { after : '2017-01-18T00:00:38', limit : 50, skip : 0 };

    function fetchAndHandle(type, parameters) {
        
        var updatesPromise = utApi.getDocuments(type, parameters);
        updatesPromise.then(function(response) {
            var resp = JSON.parse(response);

            var skip = parameters['skip'];
            var docs = resp['documents'];
            var total = resp['total'];  
    
            console.log("total - skip - count:", total, skip, docs.length)
            if (total - skip <= 0) {
                return;
            } else {
                parameters['skip'] += docs.length;
            }

            var checkUpdatesPromise = checkUpdates(type, docs);

            checkUpdatesPromise.then(function(response) {
                // Fetch next 50
                console.log("fetchAndHandle")
                fetchAndHandle(type, parameters);
            }, function(error) {
                console.log(error);
                return;
            });
        
        }, function(error) {
            console.log(error);
            return;
        });
        
    }

    fetchAndHandle(type, parameters);

    
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
