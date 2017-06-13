'use strict';

const crypto = require('crypto')
const fs = require('fs')

function file_md5(filename) {
    return new Promise((resolve, reject) => {
        var hash = crypto.createHash('md5'),
            stream = fs.createReadStream(filename)

        stream.on('data', function (data) {
            hash.update(data, 'utf8')
        })

        stream.on('end', function () {
            resolve(hash.digest('hex'))
        })
    })
}

module.exports = {file_md5}
