const utApi = require('./utApi.js');
const utDb = require('./db.js');


const updateDocument = (type, id) => {
    return new Promise( async (resolve, reject) => {
        try {
            var doc = await utApi.getDocument(type, id);
            console.log(typeof doc);
            await utDb.updateDocument(type, id, doc);
            console.log("type", type, "id", id);
            resolve({type: type, inserted: id});
        } catch (error) {
            if (error.httpStatusCode) {
                switch (error.httpStatusCode) {
                    case 404:
                    console.log("deleting ", type, id);
                        await utDb.deleteDocument(type, id);
                        resolve({ type : type, deleted: id});
                    default:
                        reject(error);
                }
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

        try {

             var ids = docUpdates.map((upd) => upd._id);

            if (ids.length === 0) {

                resolve({ type: type, "message" : "no IDs" });

            } else {

                var updateDocPromises = [];
                var dbDocs = {};
                var dbDocArray = await utDb.getDocumentsByIds(type, ids);

                for (let row of dbDocArray) {
                    dbDocs[row.id] = row.attribs;
                }

                for (let upd of docUpdates) {

                    if (dbDocs.hasOwnProperty(upd._id)) { 

                        if (dbDocs[upd._id].endret !== upd.endret) {
                            updateDocPromises.push(updateDocument(type, upd._id));
                        }

                    } else {
                        updateDocPromises.push(updateDocument(type, upd._id));
                    }

                }
                
                Promise.all(updateDocPromises)
                .then((data) => { resolve(); })
                .catch((error) => { console.log(error); reject(error); });
        

            }
        } catch (error) {
            console.log(error);
            reject(error);

        }    
    
    });
}

const handleUpdates = async (type, parameters) => {

    let total;
    parameters = parameters || { after : '2017-04-07T00:00:38', limit : 50, skip : 0 };
    // var parameters = parameters || { after : '2017-01-18T00:00:38', limit : 50, skip : 0 };

    while (parameters.skip < ( total || Infinity )) {

        try {
            console.log(parameters.skip);
            console.log(type, parameters);
            var updates = await utApi.getDocuments(type, parameters);
            await mergeInUpdates(type, updates.documents);
            total = updates.total;
            parameters.skip += 50;
        } catch (error) {
            console.log("handle updates error");
            console.log(error);
            break;
        }
    }
}

// const test = async (type, id) => {
//     // parameters = id || { after : '2017-03-11T00:00:38', limit : 50, skip : 0 };
//     try{
//         var updates = await utApi.getDocument(type, "54ad277e7a50d62f27008242");
//         console.log(updates);

//     } catch (error) {

//         if (error.httpStatusCode) {
//             console.log("does not exist");
//         }
//     }
// }


utDb.createGeomJsonbTable("turer");
utDb.createGeomJsonbTable("omrader");
utDb.createGeomJsonbTable("steder");
utDb.createGeomJsonbTable("bilder");
utDb.createGeomJsonbTable("grupper");


handleUpdates("turer");
// test("turer")
// handleUpdates("grupper");
// handleUpdates("bilder");
// handleUpdates("steder");
