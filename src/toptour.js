const utApi = require('./utApi.js');
const utDb = require('./db.js');


const updateDocument = (type, id) => {
    return new Promise(function(resolve, reject) {
        try {
            // var doc = await utApi.getDocument(type, id);
            // var k = await utDb.updateDocument(type, id, doc);
            resolve(doc);
        } catch (error) {
            // handle 404 => delete
            if (error == 404) {

            }
            console.log(error);
            reject(error);
        }
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

const mergeInUpdates = async (type, docUpdates) => {

    return new Promise(async (resolve, reject) => {

        var ids = docUpdates.map((upd) => upd._id);

        var updateDocPromises = [];
        var dbDocs = {};
        var dbDocArray = await utDb.getDocumentsByIds(type, ids);

        for (let row of dbDocArray) {
            dbDocs[row.id] = row.attribs;
        }

        // iterate over documents in 
        for (let upd of docUpdates) {

            // if db-doc contained in ids
            if (dbDocs.hasOwnProperty(upd._id)) {
                console.log(upd._id);
                // if the timestamp is not equal
                if (dbDocs[upd._id].endret !== upd.endret) {
                    updateDocPromises.push(updateDocument(type, upd._id));
                }


            // if db-docs not
            } else {
                updateDocPromises.push(updateDocument(type, upd._id));
            }

        }
        
        // wait for all promises to complete (updating documents)
        Promise.all(updateDocPromises)
        .then((data) => { resolve(); })
        .catch((error) => { reject(error); });
        console.log(updateDocPromises);

    });
}






// function checkUpdates(type, docUpdates) {





//     return new Promise(function(resolve, reject) {

//         var ids = documents.map(doc => doc['_id']);

//         if (ids.length == 0) {
//             return;
//         }

//         utDb.getDocumentsByIds(type, ids)
//         .then(function(rows) {

//             var newDocs = [];
//             var oldDocs = [];

//             if (rows.length > 0) {

//                 for (let update of documents) {
//                     var found = false;
//                     for (let row of rows) {
//                         if (update['_id'] == row['id']) {
//                             found = true;
//                             if (update['endret'] != row['attribs']['endret']) {
//                                 // The document must be updated
//                                 oldDocs.push(update);
//                             }
//                         }
//                     }
//                     if (!found) {
//                         // The document does not exist in database
//                         newDocs.push(update);
//                     }
//                 }
//             } else {
//                 newDocs = documents;
//             }

//             var getAndUpsert = [];

//             for (let update of newDocs) {
//                 getAndUpsert.push(insertDocument(type, update['_id']));
//             }

//             for (let update of oldDocs) {
//                 getAndUpsert.push(updateDocument(type, update['_id']));
//             }
//             console.log(getAndUpsert, "getandupsert");
//             if (getAndUpsert.length == 0) {
//                 resolve();
//             } else {
//                 Promise.all(getAndUpsert).then(resolve);
//             }

//         }, function(error) {
//             reject(error);
//         });

//     });

// } 

const handleUpdates = async (type, parameters) => {

    parameters = parameters || { after : '2017-03-11T00:00:38', limit : 50, skip : 0 };
    // var parameters = parameters || { after : '2017-01-18T00:00:38', limit : 50, skip : 0 };

    try {

        var updates = await utApi.getDocuments(type, parameters);
        await mergeInUpdates(type, updates.documents);
        console.log("merge in done")
        getMore = false;
    } catch (error) {
        console.log("handle updates error");
        console.log(error);
    }
}

const test = async (type, id) => {
    // parameters = id || { after : '2017-03-11T00:00:38', limit : 50, skip : 0 };
    try{
        var updates = await utApi.getDocument(type, "54ad277e7a50d62f27008242");
        console.log(updates);

    } catch (error) {

        if (error.httpStatusCode) {
            console.log("does not exist");
        }        
        // console.log(error.type, error);
    }
}


utDb.createGeomJsonbTable("turer");
utDb.createGeomJsonbTable("omrader");
utDb.createGeomJsonbTable("steder");
utDb.createGeomJsonbTable("bilder");
utDb.createGeomJsonbTable("grupper");


// handleUpdates("turer");
test("turer")
// handleUpdates("grupper");
// handleUpdates("bilder");
// handleUpdates("steder");
