'use strict';

const request = require('request')

const METHOD_GET = 1
const METHOD_POST = 2

function makeQuery(method, url, data) {
    return new Promise((resolve, reject) => {
        // Set the headers
        var headers = {
            'User-Agent': 'NRabion Launcher',
            'Content-Type': 'application/x-www-form-urlencoded'
        }

        // Configure the request
        var options = null
        if (method == METHOD_GET) {
            options = {
                url: url,
                method: 'GET',
                headers: headers,
                qs: data
            }
        } else if (method == METHOD_POST) {
            options = {
                url: url,
                method: 'POST',
                headers: headers,
                form: data
            }
        }

        // Start the request
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body, response)
            } else {
                reject(error, response)
            }
        })
    })
}

function makeGET(url, data) {
    return makeQuery(METHOD_GET, url, data)
}

function makePOST(url, data) {
    return makeQuery(METHOD_POST, url, data)
}

module.exports = {makeGET, makePOST}
