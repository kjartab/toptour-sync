var request = require('request');
require('./env.js');

var host = 'https://' + process.env['SYS_ENV'] + '.nasjonalturbase.no';
var apiKey = process.env['UTNO_API_KEY'];

function getDocuments(type, parameters) {
    var url = host + "/" + type;
    return get(url, parameters);
}

function getDocument(type, id) {
    var url = host + "/" + type;
    url += id ? "/" + id : "";
    return get(url);
}

function get(url, parameters) {

    return new Promise(function (resolve, reject) {
        parameters = parameters || {};
        parameters['api_key'] = apiKey;
        console.log(parameters);
        request.get({url:url, qs:parameters}, function(err, response, body) {
            // console.log(err, response, body);
            if (err) {
                reject(err);
                return;
            }
            console.log(response.statusCode, parameters['id'], url)
            if (response.statusCode == 200) {
                resolve(body);
            } else {
                // console.log(response);
                reject(new Error("Request failed. Status code: "  + response.statusCode + ", " + body["message"]));
            }
            // body = JSON.parse(body);
        });
    }); 
}


function post(url, body, parameters) {
    parameters = parameters || {};
    parameters['api_key'] = apiKey;

    return new Promise(function (resolve, reject){
        request.get({url:url, qs:parameters, body:body}, function(err, response, body) {
            console.log(response);
            if (err) {
                reject(err);
            }

            if (response.statusCode == 200 || response.statusCode == 201) {
                resolve(response);
            }
            reject(new Error("Request failed. Status code:" + response.statusCode));
        });

    });
}


module.exports = {
    getDocuments : getDocuments, 
    getDocument : getDocument, 
    post : post
};

    