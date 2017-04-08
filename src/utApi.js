var request = require('request');
require('./env.js');

var host = 'https://' + process.env['SYS_ENV'] + '.nasjonalturbase.no';
var apiKey = process.env['UTNO_API_KEY'];

console.log(host);
const getDocuments = (type, parameters) => { 
    var url = host + "/" + type;
    return get(url, parameters);
}

const getDocument = (type, id) => {
    var url = host + "/" + type;
    url += id ? "/" + id : "";
    return get(url);
}

function get(url, parameters) {

    return new Promise(function (resolve, reject) {
        parameters = parameters || {};
        parameters['api_key'] = apiKey;

        console.log(url, parameters);
        request.get({url:url, qs:parameters, json:true }, function(err, response, body) {
            if (err) {
                reject(err);
            } else {
                if (response.statusCode == 200) {
                    resolve(body);
                } else {
                    reject({ httpStatusCode : response.statusCode});
                }
            }            
        });
    }); 
}


// function post(url, body, parameters) {
//     parameters = parameters || {};
//     parameters['api_key'] = apiKey;

//     return new Promise(function (resolve, reject){
//         console.log(url, parameters);
//         request.get({url:url, qs:parameters, body:body}, function(err, response, body) {
//             console.log(response);
//             if (err) {
//                 reject(err);
//             }

//             if (response.statusCode == 200 || response.statusCode == 201) {
//                 resolve(response);
//             }
//             reject(new Error("Request failed. Status code:" + response.statusCode));
//         });

//     });
// }


module.exports = {
    getDocuments : getDocuments, 
    getDocument : getDocument, 
    // post : post
};

    