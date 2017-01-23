const utDb = require('./db.js');
const elasticsearch = require('elasticsearch');



function update(doc, id, docAction) {

    switch(docAction) {

        case 'delete': 
            es.delete(id, type);
            break;

        case 'create':
            es.create(id, type, doc);
            break;

        case 'update':
            es.update(id, type, doc);
            break;
    }


}

