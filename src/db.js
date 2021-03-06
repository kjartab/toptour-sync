var Pool = require('pg').Pool;

console.log(process.env);

var pool = new Pool({
    user: process.env['DB_USER'], //env var: PGUSER 
    database: process.env['DB_DATABASE'], //env var: PGDATABASE 
    password: process.env['DB_PASSWORD'], //env var: PGPASSWORD 
    host: process.env['DB_HOST'], // Server hosting the postgres database 
    max: process.env['DB_MAX_CLIENTS'], // max number of clients in pool
    port: process.env['DB_PORT'],
    idleTimeoutMillis: 1000, // close & remove clients which have been idle > 1 second
});

var schema = 'utno' + (process.env['SYS_ENV'] == 'dev' ? '_dev' : '');

pool.on(' error', function(e, client) {
    console.log("db error", e.message, e.trace);
});


function createGeomJsonbTable(table) {
    var query = "CREATE TABLE IF NOT EXISTS " + schema + "." + table + " (id varchar primary key, attribs jsonb, geom geometry)"
    return poolQuery(query);
}

function createSchema(schema) {
    var query = "CREATE SCHEMA IF NOT EXISTS " + schema;
    var tuples = [];
    return poolQuery(query, tuples);
}

function getDocument(parameters) {
    var type = parameters.type;
    var id = parameters.id;
    var query = 'SELECT id, attribs, ST_AsgeoJson(geom) FROM ' + schema + '.' + type + ' WHERE id=$1';
    var tuples = [id]
    return poolQuery(query, tuples);
}

function getDocumentsByIds(type, ids) {

    var params = [];
    for (var i=0; i<ids.length; i++) {
        params.push("$"+(i+1));
    }

    var query = 'SELECT id, attribs, ST_AsgeoJson(geom) FROM ' + schema + '.' + type + ' WHERE id IN (' + params.join(",") + ');';
    return poolQuery(query, ids);
}

function getDocuments(parameters) {
    var type = parameters.type;
    
    var tuples = [];
    if (parameters.limit) {
        tuples.push(parameters.limit);
    }
    var query = 'SELECT id, attribs, ST_AsgeoJson(geom) FROM ' + schema + '.' + type;
    if (tuples.length > 0) {
        query += ' LIMIT $1'; 
    }
    console.log(tuples, query);
    return poolQuery(query, tuples);
}

function getAttributes(doc) {
    var attribs = {};
    for (var key in doc) {
        if (key != 'geojson') {
            attribs[key] = doc[key];
        }
    }
    return attribs;
}

function getGeometry(doc) {
    if (doc.hasOwnProperty('geojson')) {
        return doc['geojson'];
    };
    return null;        
}

function insertDocument(type, id, doc) {
    doc = JSON.parse(doc);
    var attribs = getAttributes(doc);
    var geom = getGeometry(doc);
    var tuples = [attribs, geom];

    var alt = "";
    var altvar = "";
    if (id) {
        alt = ",id";
        altvar = ",$3";
        tuples.push(id);
    }
    var query = "INSERT INTO " + schema + "." + type + "(attribs, geom " + alt + ") VALUES ($1, ST_GeomFromGeojson($2) " + altvar + " );";
    return poolQuery(query, tuples);

}

function updateDocument(type, id, doc) {
    doc = JSON.parse(doc);
    var attribs = getAttributes(doc);
    var geom = getGeometry(doc);
    var tuples = [attribs, geom, id];

    var query = "UPDATE " + schema + "." + type + " SET attribs = $1, geom = ST_GeomFromGeojson($2) WHERE id=$3";
    return poolQuery(query, tuples);

}

function upsertDocument(type, id, document) {
    var query = 'SELECT ' + schema + '.' + type + ' WITH VALUES ' + values + ' WHERE id='+id;
    var tuples = [id];

    return new Promise(function(resolve, reject) {
        var upsertPromise = poolQuery(query, tuples);
        upsertPromise
        .then(resolve)
        .catch(reject);
    });
}

function deleteDocument(type, id) {
    var query = 'DELETE FROM ' + schema + '.' + type + ' WHERE id=$1::varchar;'
    var tuples = [id]
    return poolQuery(query, tuples);
}

function poolQuery(query, tuples) {

    return new Promise(function(resolve, reject) {

        pool.connect(function(err, client, done) {
            if (err) {
                reject(err);
                return;
            }

            client.query(query, tuples, function(err, result) {
                
                done();

                if(err) {
                    reject(err);
                } else {
                    resolve(result.rows);
                }

            });
        })
    });
}


module.exports = {
    getDocument : getDocument,
    getDocuments : getDocuments,
    getDocumentsByIds : getDocumentsByIds,
    upsertDocument : upsertDocument,
    updateDocument : updateDocument,
    insertDocument : insertDocument,
    createSchema : createSchema,
    createGeomJsonbTable : createGeomJsonbTable
}