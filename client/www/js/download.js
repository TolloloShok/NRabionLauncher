const request = require('request')
const http = require('http')
const fs = require('fs')

function downloadFile(configuration) {
    return new Promise(function(resolve, reject){
        // Save variable to know progress
        var received_bytes = 0;
        var total_bytes = 0;

        var req = request({
            method: 'GET',
            uri: configuration.remoteFile
        });

        var out = fs.createWriteStream(configuration.localFile);
        req.pipe(out);

        req.on('response', function ( data ) {
            // Change the total bytes value to get progress later.
            total_bytes = parseInt(data.headers['content-length']);
        });

        // Get progress if callback exists
        if (configuration.hasOwnProperty("onProgress")){
            req.on('data', function(chunk) {
                // Update the received bytes
                received_bytes += chunk.length;

                configuration.onProgress(received_bytes, total_bytes);
            });
        } else {
            req.on('data', function(chunk) {
                // Update the received bytes
                received_bytes += chunk.length;
            });
        }

        req.on('end', function() {
            resolve();
        });
    });
}

function downloadObject(url_object) {
    return new Promise(function(resolve, reject){
        http.get(url_object, function(resource) {
            var content = '';

            resource.setEncoding('utf8')
            resource.on('data', function (data) {
                content += data;
            });
            resource.on('end', () => {
                resolve(JSON.parse(content));
            });
        });
    });
}

module.exports = {downloadFile, downloadObject}
