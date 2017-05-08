'use strict';

let http = require('http')
let url = require('url')
let nconf = require('nconf')
let path = require('path')

const CONFIG_VERSION_LAUNCHER = "version_minecraft"

const {UpdaterMinecraft} = require("./updater.js")
const pager = require("./pager.js")
const consts = require('./consts.js')

let mcUpdater = new UpdaterMinecraft()

nconf.use('file', { file: path.join(mcUpdater.getDir(), 'launcher_config.json') })
nconf.load()

function showActualyScreen() {
    if (mcUpdater.checkUpdate() || nconf.get(CONFIG_VERSION_LAUNCHER) === undefined) {
        pager.show(pager.PAGE_DOWNLOAD)
        requestDataClient((data) => {
            // TODO: Добавить этот вызов в callbackComplete
            // nconf.set(CONFIG_VERSION_LAUNCHER, data.version)
            // nconf.save()

            mcUpdater.updateFull(data)
        });
    } else {
        pager.show(pager.PAGE_AUTH)
    }
}

function requestDataClient(callback) {
    // Get data for client update
    http.get(url.resolve(consts.URL_BASE, 'data.json'), function(resource) {
        resource.setEncoding('utf8')
        resource.on('data', function (data) {
            var data = JSON.parse(data)
            callback(data)
        });
    });
}

showActualyScreen()
